import { Billboard, Text } from '@react-three/drei'
import { type ThreeEvent } from '@react-three/fiber'
import { useWorld } from 'koota/react'
import { useEffect, useState } from 'react'
import type { Entity } from 'koota'
import GameMenu from './GameMenu'
import SettlementMenu from './SettlementMenu'
import BattleSystems from '../components/BattleSystems'
import UnitRenderer from '../components/UnitRenderer'
import DragUnitProxy from '../components/DragUnitProxy'
import { spawnActions, combatActions, WALL_SLOTS, WALL_POSITION } from '../core/actions'
import { IsDefender, IsArcher, IsSpearman, IsCatapult, Position, Health } from '../core/traits'

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

type UnitType = 'bow' | 'spear' | 'catapult'
type StockUnit = { hp: number }
type Barracks = Record<UnitType, StockUnit[]>

type DragState =
  | { source: 'unit'; entity: Entity; type: UnitType }
  | { source: 'button'; type: UnitType }
  | null

export default function BattleFieldSpace({
  paused,
  gameOver,
  onPause,
  onResume,
  onRestart,
  onExitToMenu,
  onGameOver,
  onDragStateChange,
}: {
  paused: boolean
  gameOver: boolean
  onPause: () => void
  onResume: () => void
  onRestart: () => void
  onExitToMenu: () => void
  onGameOver: () => void
  onDragStateChange?: (dragging: boolean) => void
}) {
  const world = useWorld()
  const [barracks, setBarracks] = useState<Barracks>({ bow: [], spear: [], catapult: [] })
  const [dragState, setDragState] = useState<DragState>(null)

  // 通知 App 屏蔽 OrbitControls
  useEffect(() => {
    onDragStateChange?.(dragState !== null)
  }, [dragState, onDragStateChange])

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

  // ── 拖拽起点 ──
  const startUnitDrag = (entity: Entity) => {
    setDragState({ source: 'unit', entity, type: unitTypeOf(entity) })
  }

  const startButtonDrag = (e: ThreeEvent<PointerEvent>, type: UnitType) => {
    e.stopPropagation()
    if (barracks[type].length === 0) return
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

    if (occupant) {
      // 原兵回兵营（保留血量）
      const occupantType = unitTypeOf(occupant)
      const hp = occupant.get(Health)?.current ?? 0
      setBarracks((prev) => ({
        ...prev,
        [occupantType]: [...prev[occupantType], { hp }],
      }))
      combat.recycleDefenderUnit(occupant)
    }

    // 部署拖拽兵种（shift一个 stock）
    const { hp: deployHp } = stock[0]
    setBarracks((prev) => ({
      ...prev,
      [drag.type]: prev[drag.type].slice(1),
    }))
    spawnDefender(drag.type, WALL_SLOTS[slotIndex], deployHp)
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
      <BattleSystems paused={paused || gameOver} onGameOver={onGameOver} />

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
      />

      {/* 按钮行整体回收检测条带（invisible，仅作 raycaster 命中） */}
      {!gameOver && (
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

      {/* five buttons: 0.84 square planes, billboard to face camera */}
      {!gameOver &&
        BUTTON_NAMES.map((name, i) => {
          const type = BUTTON_TYPES[i]
          const count = type ? barracks[type].length : 0
          return (
            <Billboard key={name} position={[BUTTON_X[i], 2.0, 4.0]}>
              <mesh
                name={name}
                onPointerDown={
                  type
                    ? (e: ThreeEvent<PointerEvent>) => startButtonDrag(e, type)
                    : name === 'btn_menu' && !paused
                    ? (e: ThreeEvent<PointerEvent>) => {
                        e.stopPropagation()
                        onPause()
                      }
                    : undefined
                }
              >
                <planeGeometry args={[0.8, 0.8]} />
                <meshBasicMaterial color={BUTTON_COLORS[i]} />
              </mesh>
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
            </Billboard>
          )
        })}

      {/* 拖拽示意物：拖拽期间显示，跟随 pointer 在 y=6 平面 */}
      {dragState && <DragUnitProxy color={DRAG_COLORS[dragState.type]} />}

      {paused && !gameOver && (
        <GameMenu onResume={onResume} onRestart={onRestart} onExitToMenu={onExitToMenu} />
      )}

      {gameOver && (
        <SettlementMenu onRestart={onRestart} onExitToMenu={onExitToMenu} />
      )}
    </group>
  )
}
