import { Billboard } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Image, Text } from '@react-three/uikit'
import { Button } from '@react-three/uikit-default'
import { useWorld } from 'koota/react'
import { useEffect, useRef, useState } from 'react'
import type { Entity } from 'koota'
import GameMenu from './GameMenu'
import SettlementMenu from './SettlementMenu'
import ShopScreen, { type UnitType } from './ShopScreen'
import BattleSystems from '../components/BattleSystems'
import UnitRenderer from '../components/UnitRenderer'
import GroundModel from '../components/GroundModel'
import DragUnitProxy from '../components/DragUnitProxy'
import RoundPromptPanel from '../components/RoundPromptPanel'
import { spawnActions, combatActions, WALL_SLOTS, WALL_POSITION, DEFENDER_ARCHER_HP, DEFENDER_SPEAR_BREAKER_HP } from '../core/actions'
import { IsDefender, IsArcher, IsSpearBreaker, IsEnemy, Position, Health, Targeting, CanAttackUnits } from '../core/traits'
import { createRoundEngine, type RoundEngine } from '../core/rounds/rounds-engine'
import { ROUNDS, START_ROUND, TEST_GOLD, TEST_WAVE, buildTestRound, type RoundConfig } from '../core/rounds/rounds.config'

const BUTTON_NAMES = ['btn_bow', 'btn_spear', 'btn_focus', 'btn_shop', 'btn_menu'] as const
// 间距 0.9、外缘 ±2.2：最窄主流机型 360px 宽（可视半宽 2.25）下留 4px 余量不被裁切
const BUTTON_X = [-1.8, -0.9, 0, 0.9, 1.8]
// 按钮底色：全部统一中灰半透明
const BUTTON_COLORS = ['#888888', '#888888', '#888888', '#888888', '#888888']
const BUTTON_OPACITY = 0.75
// 图标颜色直接烤进 SVG（uikit Image 的 color prop 不生效，贴图原色直通）
// 与 BUTTON_NAMES 对齐：前 2 个兵种按钮有库存，focus/Shop/Menu 无
const BUTTON_TYPES: (UnitType | null)[] = ['bow', 'spear', null, null, null]
// 资源版本号：改 SVG 后递增，强制浏览器重新下载（避免缓存旧图）
const ASSET_VERSION = 10
const BASE = import.meta.env.BASE_URL
// 与 BUTTON_NAMES 对齐：兵种/商店/菜单均使用 SVG 图标（透明背景）
// 导出供 LoadingSpace 预热 —— 否则战斗首帧 useTexture 会在无 Suspense 边界处挂起
export const BUTTON_IMAGES = [
  `${BASE}assets/svg/icon-bow.svg?v=${ASSET_VERSION}`,
  `${BASE}assets/svg/icon-spear.svg?v=${ASSET_VERSION}`,
  `${BASE}assets/svg/icon-focus.svg?v=${ASSET_VERSION}`,
  `${BASE}assets/svg/icon-shop.svg?v=${ASSET_VERSION}`,
  `${BASE}assets/svg/icon-menu.svg?v=${ASSET_VERSION}`,
]

// 拖拽示意物染色：与各兵种守军模型颜色一致
const DRAG_COLORS: Record<UnitType, string> = {
  bow: '#4a90d9',
  spear: '#4a9d8f',
}
// 集火拖拽示意物颜色（红色）
const FOCUS_DRAG_COLOR = '#ff3333'
// 集火落点检测半径（米）：以落点 XZ 为中心扫描存活敌人，取最近
const FOCUS_DROP_RADIUS = 1.0

type StockUnit = { hp: number }
type Barracks = Record<UnitType, StockUnit[]>

// 雇佣满血常量
const UNIT_MAX_HP: Record<UnitType, number> = { bow: DEFENDER_ARCHER_HP, spear: DEFENDER_SPEAR_BREAKER_HP }

/** 从 stock 中取出血量最大的单位，返回其 hp 与剔除后的数组（并列取首个） */
const takeMaxHpStock = (stock: StockUnit[]): { hp: number; rest: StockUnit[] } => {
  if (stock.length === 0) return { hp: 0, rest: [] }
  let maxIdx = 0
  for (let i = 1; i < stock.length; i++) {
    if (stock[i].hp > stock[maxIdx].hp) maxIdx = i
  }
  return {
    hp: stock[maxIdx].hp,
    rest: [...stock.slice(0, maxIdx), ...stock.slice(maxIdx + 1)],
  }
}

type DragState =
  | { source: 'unit'; entity: Entity; type: UnitType }
  | { source: 'button'; type: UnitType }
  | { source: 'focus' }
  | null

type PromptState =
  | { kind: 'none' }
  | { kind: 'intro'; round: RoundConfig }
  | { kind: 'ending'; round: RoundConfig }

export default function BattleFieldSpace({
  paused,
  gameOver,
  gameResult,
  onPause,
  onResume,
  onRestart,
  onExitToMenu,
  onGameOver,
}: {
  paused: boolean
  gameOver: boolean
  gameResult: 'victory' | 'defeat' | null
  onPause: () => void
  onResume: () => void
  onRestart: () => void
  onExitToMenu: () => void
  onGameOver: (result: 'victory' | 'defeat') => void
}) {
  const world = useWorld()
  // 测试关卡：START_ROUND === -1 时仅单轮 + 足额金币
  const testMode = START_ROUND === -1
  const [barracks, setBarracks] = useState<Barracks>({ bow: [], spear: [] })
  const [dragState, setDragState] = useState<DragState>(null)
  const [gold, setGold] = useState(testMode ? TEST_GOLD : 0)
  const [shopOpen, setShopOpen] = useState(false)
  const [prompt, setPrompt] = useState<PromptState>({ kind: 'none' })
  const regenAccumRef = useRef(0)

  // 轮次引擎（创建一次，回调绑定 React state）
  const engineRef = useRef<RoundEngine | null>(null)
  if (!engineRef.current) {
    const configs = testMode ? [buildTestRound(TEST_WAVE)] : ROUNDS
    engineRef.current = createRoundEngine(configs, {
      onIntro: (round) => setPrompt({ kind: 'intro', round }),
      onEnding: (round) => {
        setGold((g) => g + round.gold)
        setPrompt({ kind: 'ending', round })
      },
      onAllDone: () => onGameOver('victory'),
    })
  }
  const engine = engineRef.current

  const barracksCount = barracks.bow.length + barracks.spear.length
  const promptOpen = prompt.kind !== 'none'

  // 兵营单位回血：每5秒回10点，上限为该兵种 max HP；暂停/结算/提示阶段停止
  useFrame((_, delta) => {
    if (paused || gameOver || promptOpen) return
    regenAccumRef.current += delta
    if (regenAccumRef.current < 5) return
    const ticks = Math.floor(regenAccumRef.current / 5)
    regenAccumRef.current -= ticks * 5
    setBarracks((prev) => {
      let changed = false
      const next: Barracks = { bow: [], spear: [] }
      for (const t of ['bow', 'spear'] as UnitType[]) {
        const max = UNIT_MAX_HP[t]
        next[t] = prev[t].map((u) => {
          if (u.hp >= max) return u
          changed = true
          return { hp: Math.min(max, u.hp + ticks * 10) }
        })
      }
      return changed ? next : prev
    })
  })

  // 胜负结算或提示面板出现时自动关闭商店
  useEffect(() => {
    if (gameOver) {
      setShopOpen(false)
      setPrompt({ kind: 'none' })
    } else if (promptOpen) {
      setShopOpen(false)
    }
  }, [gameOver, promptOpen])

  /** 判定实体兵种 */
  const unitTypeOf = (e: Entity): UnitType => {
    if (e.has(IsArcher)) return 'bow'
    if (e.has(IsSpearBreaker)) return 'spear'
    // 退定值（守军必然属于两类之一，理论上不会到这里）
    return 'spear'
  }

  /** 查询某 slot 上是否已有守军 */
  const findDefenderAtSlot = (slotIndex: number): Entity | null => {
    const slotX = WALL_SLOTS[slotIndex]
    const list = world.query(IsDefender, Position)
    return list.find((e) => Math.abs(e.get(Position)!.x - slotX) < 0.01) ?? null
  }

  /** 部署指定兵种到 slot（带保留血量） */
  const spawnDefender = (type: UnitType, slotX: number, hp: number) => {
    const spawn = spawnActions(world)
    if (type === 'bow') spawn.spawnDefenderArcher(slotX, 2, WALL_POSITION.z, hp)
    else spawn.spawnDefenderSpearBreaker(slotX, 2, WALL_POSITION.z, hp)
  }

  /** 商店雇佣：金币足够则扣金币 + 入兵营（满血） */
  const handleHire = (type: UnitType, cost: number) => {
    if (gold < cost) return
    setGold((g) => g - cost)
    setBarracks((prev) => ({ ...prev, [type]: [...prev[type], { hp: UNIT_MAX_HP[type] }] }))
  }

  // ── 拖拽起点 ──
  const startUnitDrag = (entity: Entity) => {
    if (paused || gameOver || promptOpen) return
    setDragState({ source: 'unit', entity, type: unitTypeOf(entity) })
  }

  const startButtonDrag = (e: ThreeEvent<PointerEvent>, type: UnitType) => {
    e.stopPropagation()
    if (promptOpen || barracks[type].length === 0) return
    setDragState({ source: 'button', type })
  }

  // ── 集火拖拽起点 ──
  const startFocusDrag = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (paused || gameOver || promptOpen) return
    setDragState({ source: 'focus' })
  }

  // ── 集火落点：以落点 XZ 为中心扫描最近存活敌人，让射程内守军集火 ──
  const handleFocusDrop = (dropX: number, dropZ: number) => {
    setDragState(null)
    let nearest: Entity | null = null
    let nearestDist = Infinity
    world.query(IsEnemy, Position, Health).readEach(([pos, hp], enemy) => {
      if (hp.current <= 0) return
      const dx = pos.x - dropX
      const dz = pos.z - dropZ
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist <= FOCUS_DROP_RADIUS && dist < nearestDist) {
        nearestDist = dist
        nearest = enemy
      }
    })
    if (nearest) combatActions(world).focusFire(nearest)
  }

  // ── 拖拽落点：WallSlot ──
  const handleDropToSlot = (slotIndex: number) => {
    const drag = dragState
    if (!drag) return
    // 集火拖拽落在 slot 上 = 取消
    if (drag.source === 'focus') {
      setDragState(null)
      return
    }
    setDragState(null)

    const occupant = findDefenderAtSlot(slotIndex)
    const combat = combatActions(world)

    if (drag.source === 'unit') {
      if (!occupant) {
        combat.moveUnitToSlot(drag.entity, WALL_SLOTS[slotIndex])
      } else if (occupant.id() !== drag.entity.id()) {
        combat.swapUnitPositions(drag.entity, occupant)
      }
      // 同 slot 松开 = 无操作
      return
    }

    // source === 'button'
    const stock = barracks[drag.type]
    if (stock.length === 0) return

    // 先从兵营取血量最大的单位，再回收原兵，避免刚回营的原兵被立刻选中
    const { hp: deployHp, rest } = takeMaxHpStock(stock)
    // 必须在 setBarracks 回调外同步读取：recycleDefenderUnit 会销毁实体，
    // React 18 batching 下回调延迟执行，届时 occupant trait 已失效，unitTypeOf 会 fallback 到 'spear'
    const occupantType = occupant ? unitTypeOf(occupant) : null
    const occupantHp = occupant?.get(Health)?.current ?? 0
    setBarracks((prev) => {
      const next = { ...prev, [drag.type]: rest }
      if (occupant && occupantType) {
        next[occupantType] = [...next[occupantType], { hp: occupantHp }]
      }
      return next
    })
    if (occupant) combat.recycleDefenderUnit(occupant)

    spawnDefender(drag.type, WALL_SLOTS[slotIndex], deployHp)
  }

  // ── 拖拽落点：敌人单位（手动更换攻击目标 / 集火） ──
  const handleDropToEnemy = (enemy: Entity) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const drag = dragState
    if (!drag) return
    setDragState(null)

    // 集火拖拽：以落点 XZ 为中心扫描最近存活敌人并集火
    if (drag.source === 'focus') {
      handleFocusDrop(e.point.x, e.point.z)
      return
    }

    // 仅守军单位拖拽
    if (drag.source !== 'unit') return

    const defenderPos = drag.entity.get(Position)
    const enemyPos = enemy.get(Position)
    const canAttack = drag.entity.get(CanAttackUnits)
    if (!defenderPos || !enemyPos || !canAttack) return

    // 距离 ≤ 攻击射程才允许换目标
    const dx = defenderPos.x - enemyPos.x
    const dz = defenderPos.z - enemyPos.z
    if (Math.sqrt(dx * dx + dz * dz) > canAttack.range) return

    // Targeting 是 exclusive relation，add 时自动移除旧目标
    drag.entity.add(Targeting(enemy))
  }

  // ── 拖拽落点：按钮行（回收） ──
  const handleDropToBarracks = () => {
    const drag = dragState
    // 先无条件清空：兵营按钮起的拖拽落回按钮行 = 取消。
    // 本函数带 stopPropagation，不在这里清空的话，点一下有库存的按钮会留下一个跟着指针的拖拽示意物
    setDragState(null)
    if (!drag || drag.source !== 'unit') return
    const hp = drag.entity.get(Health)?.current ?? 0
    setBarracks((prev) => ({
      ...prev,
      [drag.type]: [...prev[drag.type], { hp }],
    }))
    combatActions(world).recycleDefenderUnit(drag.entity)
  }

  return (
    <group>
      {/* 战斗系统驱动（无渲染） */}
      <BattleSystems
        paused={paused || gameOver}
        engine={engine}
        barracksDefenderCount={barracksCount}
        onRewardGained={(gold) => setGold((g) => g + gold)}
        onGameOver={onGameOver}
      />

      {/* ground: GLB 模型 15×15 手绘沙地平面，中心 (0,0,0)，远大于可视区 */}
      <GroundModel />

      {/* 拖拽兜底区：覆盖战场下方大范围，松开在空地/单位/ground 时清空 dragState
          WallSlot 与按钮行 onPointerUp 都 stopPropagation，不会冒泡到这里；
          只在没有上层命中的情况下触发，作为"拖拽取消"兜底；集火拖拽在此判定落点 */}
      <mesh
        position={[0, -0.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerUp={(e: ThreeEvent<PointerEvent>) => {
          if (dragState?.source === 'focus') {
            handleFocusDrop(e.point.x, e.point.z)
          } else {
            setDragState((prev) => (prev ? null : prev))
          }
        }}
      >
        <planeGeometry args={[20, 30]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* ECS 驱动的战场单位（城墙、敌人、守军、抛射物、WallSlot） */}
      <UnitRenderer
        onDefenderDragStart={startUnitDrag}
        onSlotOver={() => {}}
        onSlotUp={handleDropToSlot}
        onEnemyPointerUp={handleDropToEnemy}
      />

      {/* 按钮行整体回收检测条带（invisible，仅作 raycaster 命中） */}
      {!gameOver && !paused && !promptOpen && (
        <mesh
          position={[0, 1.99, 4.5]}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerUp={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation()
            handleDropToBarracks()
          }}
        >
          <planeGeometry args={[4.7, 0.8]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}

      {/* five buttons: uikit-default Button, billboard to face camera */}
      {!gameOver && !paused && !promptOpen &&
        BUTTON_NAMES.map((name, i) => {
          const type = BUTTON_TYPES[i]
          const count = type ? barracks[type].length : 0
          return (
            <Billboard key={name} position={[BUTTON_X[i], 2.0, 4.5]}>
              <Button
                width={80}
                height={80}
                backgroundColor={BUTTON_COLORS[i]}
                opacity={BUTTON_OPACITY}
                borderRadius={10}
                padding={0}
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                hover={{ backgroundColor: '#666666' }}
                onPointerDown={
                  type
                    ? (e: ThreeEvent<PointerEvent>) => {
                        e.stopPropagation()
                        startButtonDrag(e, type)
                      }
                    : name === 'btn_focus'
                    ? (e: ThreeEvent<PointerEvent>) => {
                        e.stopPropagation()
                        startFocusDrag(e)
                      }
                    : name === 'btn_shop'
                    ? (e: ThreeEvent<PointerEvent>) => {
                        e.stopPropagation()
                        setShopOpen((prev) => !prev)
                      }
                    : name === 'btn_menu' && !paused
                    ? (e: ThreeEvent<PointerEvent>) => {
                        e.stopPropagation()
                        setShopOpen(false)
                        onPause()
                      }
                    : undefined
                }
              >
                {type && count > 0 && (
                  <Text
                    positionType="absolute"
                    positionTop={4}
                    positionRight={6}
                    fontSize={16}
                    color="#ffffff"
                  >
                    {count}
                  </Text>
                )}
                {name === 'btn_shop' && (
                  <Text
                    positionType="absolute"
                    positionTop={2}
                    positionLeft="50%"
                    transformTranslateX="-50%"
                    fontSize={14}
                    color="#ffd700"
                  >
                    {Math.min(gold, 9999)}
                  </Text>
                )}
              </Button>
              <group position={[0, 0, 0.01]}> 
                <Image src={BUTTON_IMAGES[i]} width={60} height={60} opacity={1} /> 
              </group>
            </Billboard>
          )
        })}

      {/* 拖拽示意物：拖拽期间显示，跟随 pointer 在 y=6 平面。集火拖拽显示红色 focus 图标 */}
      {dragState &&
        (dragState.source === 'focus' ? (
          <DragUnitProxy color={FOCUS_DRAG_COLOR} image={BUTTON_IMAGES[2]} />
        ) : (
          <DragUnitProxy color={DRAG_COLORS[dragState.type]} />
        ))}

      {/* 轮次开场/结束提示面板 */}
      {promptOpen && (
        <RoundPromptPanel
          title={prompt.kind === 'intro' ? prompt.round.intro.title : prompt.round.ending.title}
          body={prompt.kind === 'intro' ? prompt.round.intro.body : prompt.round.ending.body}
          tip={prompt.kind === 'intro' ? prompt.round.intro.tip : prompt.round.ending.tip}
          onOk={() => {
            if (prompt.kind === 'intro') {
              engine.confirmIntro()
              setPrompt({ kind: 'none' })
            } else {
              // ending: confirmEnding 会同步触发 onIntro（下一轮）或 onAllDone（胜利）
              // 不主动清空，让对应回调设置 prompt（胜利时 useEffect 清空）
              engine.confirmEnding()
            }
          }}
        />
      )}

      {shopOpen && !gameOver && !promptOpen && (
        <ShopScreen gold={gold} onHire={handleHire} onClose={() => setShopOpen(false)} />
      )}

      {paused && !gameOver && (
        <GameMenu onResume={onResume} onRestart={onRestart} onExitToMenu={onExitToMenu} />
      )}

      {gameOver && (
        <SettlementMenu
          result={gameResult ?? 'defeat'}
          onRestart={onRestart}
          onExitToMenu={onExitToMenu}
        />
      )}
    </group>
  )
}
