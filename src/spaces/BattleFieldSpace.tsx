import { Billboard, Text } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useWorld } from 'koota/react'
import { useEffect, useRef, useState } from 'react'
import type { Entity } from 'koota'
import GameMenu from './GameMenu'
import SettlementMenu from './SettlementMenu'
import ShopScreen, { type UnitType } from './ShopScreen'
import BattleSystems from '../components/BattleSystems'
import UnitRenderer from '../components/UnitRenderer'
import DragUnitProxy from '../components/DragUnitProxy'
import RoundedShapeButton from '../components/RoundedShapeButton'
import RoundPromptPanel from '../components/RoundPromptPanel'
import { spawnActions, combatActions, WALL_SLOTS, WALL_POSITION, DEFENDER_ARCHER_HP, DEFENDER_SPEARMAN_HP, DEFENDER_CATAPULT_HP } from '../core/actions'
import { IsDefender, IsArcher, IsSpearman, IsCatapult, Position, Health, Targeting, CanAttackUnits } from '../core/traits'
import { createRoundEngine, type RoundEngine } from '../core/rounds/rounds-engine'
import { ROUNDS, type RoundConfig } from '../core/rounds/rounds.config'

const BUTTON_NAMES = ['btn_bow', 'btn_spear', 'btn_catapult', 'btn_shop', 'btn_menu'] as const
const BUTTON_X = [-1.95, -0.975, 0, 0.975, 1.95]
// 3 个兵种按钮用对应守军染色（与 CharacterProxy 一致），Shop 灰，Menu 红
const BUTTON_COLORS = ['#4a90d9', '#4a9d8f', '#6b4226', '#888888', '#cc2222']
// 与 BUTTON_NAMES 对齐：3 个兵种按钮有库存，Shop/Menu 无
const BUTTON_TYPES: (UnitType | null)[] = ['bow', 'spear', 'catapult', null, null]

// 拖拽示意物染色：与各兵种守军 CharacterProxy 颜色一致
const DRAG_COLORS: Record<UnitType, string> = {
  bow: '#4a90d9',
  spear: '#4a9d8f',
  catapult: '#6b4226',
}

type StockUnit = { hp: number }
type Barracks = Record<UnitType, StockUnit[]>

// 雇佣满血常量
const UNIT_MAX_HP: Record<UnitType, number> = { bow: DEFENDER_ARCHER_HP, spear: DEFENDER_SPEARMAN_HP, catapult: DEFENDER_CATAPULT_HP }

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
  onDragStateChange,
}: {
  paused: boolean
  gameOver: boolean
  gameResult: 'victory' | 'defeat' | null
  onPause: () => void
  onResume: () => void
  onRestart: () => void
  onExitToMenu: () => void
  onGameOver: (result: 'victory' | 'defeat') => void
  onDragStateChange?: (dragging: boolean) => void
}) {
  const world = useWorld()
  const [barracks, setBarracks] = useState<Barracks>({ bow: [], spear: [], catapult: [] })
  const [dragState, setDragState] = useState<DragState>(null)
  const [gold, setGold] = useState(0)
  const [shopOpen, setShopOpen] = useState(false)
  const [prompt, setPrompt] = useState<PromptState>({ kind: 'none' })
  const regenAccumRef = useRef(0)

  // 轮次引擎（创建一次，回调绑定 React state）
  const engineRef = useRef<RoundEngine | null>(null)
  if (!engineRef.current) {
    engineRef.current = createRoundEngine(ROUNDS, {
      onIntro: (round) => setPrompt({ kind: 'intro', round }),
      onEnding: (round) => {
        setGold((g) => g + round.gold)
        setPrompt({ kind: 'ending', round })
      },
      onAllDone: () => onGameOver('victory'),
    })
  }
  const engine = engineRef.current

  const barracksCount = barracks.bow.length + barracks.spear.length + barracks.catapult.length
  const promptOpen = prompt.kind !== 'none'

  // 兵营单位线性回血：每秒1点，上限为该兵种 max HP；暂停/结算时停止
  useFrame((_, delta) => {
    if (paused || gameOver) return
    regenAccumRef.current += delta
    if (regenAccumRef.current < 1) return
    const ticks = Math.floor(regenAccumRef.current)
    regenAccumRef.current -= ticks
    setBarracks((prev) => {
      let changed = false
      const next: Barracks = { bow: [], spear: [], catapult: [] }
      for (const t of ['bow', 'spear', 'catapult'] as UnitType[]) {
        const max = UNIT_MAX_HP[t]
        next[t] = prev[t].map((u) => {
          if (u.hp >= max) return u
          changed = true
          return { hp: Math.min(max, u.hp + ticks) }
        })
      }
      return changed ? next : prev
    })
  })

  // 通知 App 屏蔽 OrbitControls（拖拽或提示面板显示期间）
  useEffect(() => {
    onDragStateChange?.(dragState !== null || promptOpen)
  }, [dragState, promptOpen, onDragStateChange])

  // 胜负结算时自动关闭商店与提示面板
  useEffect(() => {
    if (gameOver) {
      setShopOpen(false)
      setPrompt({ kind: 'none' })
    }
  }, [gameOver])

  /** 判定实体兵种 */
  const unitTypeOf = (e: Entity): UnitType => {
    if (e.has(IsArcher)) return 'bow'
    if (e.has(IsSpearman)) return 'spear'
    if (e.has(IsCatapult)) return 'catapult'
    // 退定值（守军必然属于三类之一，理论上不会到这里）
    return 'catapult'
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
    if (type === 'bow') spawn.spawnDefenderArcher(slotX, 2.5, WALL_POSITION.z, hp)
    else if (type === 'spear') spawn.spawnDefenderSpearman(slotX, 2.5, WALL_POSITION.z, hp)
    else spawn.spawnDefenderCatapult(slotX, 2.5, WALL_POSITION.z, hp)
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

  // ── 拖拽落点：WallSlot ──
  const handleDropToSlot = (slotIndex: number) => {
    const drag = dragState
    if (!drag) return
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
    setBarracks((prev) => {
      const next = { ...prev, [drag.type]: rest }
      if (occupant) {
        const occupantType = unitTypeOf(occupant)
        const hp = occupant.get(Health)?.current ?? 0
        next[occupantType] = [...next[occupantType], { hp }]
      }
      return next
    })
    if (occupant) combat.recycleDefenderUnit(occupant)

    spawnDefender(drag.type, WALL_SLOTS[slotIndex], deployHp)
  }

  // ── 拖拽落点：敌人单位（手动更换攻击目标） ──
  const handleDropToEnemy = (enemy: Entity) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const drag = dragState
    if (!drag) return
    setDragState(null)

    // 仅守军单位拖拽，且非投石车（投石车用 CanBombard 自动周期轰炸，不走 Targeting）
    if (drag.source !== 'unit') return
    if (drag.entity.has(IsCatapult)) return

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
    if (!drag || drag.source !== 'unit') return
    setDragState(null)
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
        onEnemyKilled={(n) => setGold((g) => g + n * 10)}
        onGameOver={onGameOver}
      />

      {/* ground: plane 5×9, beach sand */}
      <mesh name="ground" position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 9]} />
        <meshStandardMaterial color="#d4c4a0" />
      </mesh>

      {/* 拖拽兜底区：覆盖战场下方大范围，松开在空地/单位/ground 时清空 dragState
          WallSlot 与按钮行 onPointerUp 都 stopPropagation，不会冒泡到这里；
          只在没有上层命中的情况下触发，作为“拖拽取消”兜底 */}
      <mesh
        position={[0, -0.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerUp={() => setDragState((prev) => (prev ? null : prev))}
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
          position={[0, 1.99, 4.0]}
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

      {/* five buttons: 0.8 square rounded planes, billboard to face camera */}
      {!gameOver && !paused && !promptOpen &&
        BUTTON_NAMES.map((name, i) => {
          const type = BUTTON_TYPES[i]
          const count = type ? barracks[type].length : 0
          return (
            <Billboard key={name} position={[BUTTON_X[i], 2.0, 4.0]}>
              <RoundedShapeButton
                name={name}
                width={0.8}
                height={0.8}
                cornerRadius={0.1}
                color={BUTTON_COLORS[i]}
                onPointerDown={
                  type
                    ? (e: ThreeEvent<PointerEvent>) => startButtonDrag(e, type)
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
              />
              {type && count > 0 && (
                <Text
                  position={[0.3, 0.3, 0.01]}
                  fontSize={0.2}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                >
                  {count}
                </Text>
              )}
              {name === 'btn_menu' && (
                <Text
                  position={[0, 0, 0.01]}
                  fontSize={0.4}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                >
                  M
                </Text>
              )}
            </Billboard>
          )
        })}

      {/* 拖拽示意物：拖拽期间显示，跟随 pointer 在 y=6 平面 */}
      {dragState && <DragUnitProxy color={DRAG_COLORS[dragState.type]} />}

      {/* 轮次开场/结束提示面板 */}
      {promptOpen && (
        <RoundPromptPanel
          title={prompt.kind === 'intro' ? prompt.round.intro.title : prompt.round.ending.title}
          body={prompt.kind === 'intro' ? prompt.round.intro.body : prompt.round.ending.body}
          tip={prompt.kind === 'intro' ? prompt.round.intro.tip : undefined}
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

      {shopOpen && !gameOver && (
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
