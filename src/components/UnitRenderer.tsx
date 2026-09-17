import { useQuery, useQueryFirst } from 'koota/react'
import type { Entity } from 'koota'
import { type ThreeEvent } from '@react-three/fiber'
import {
  IsEnemy,
  IsDefender,
  IsArcher,
  IsMelee,
  IsSpearman,
  IsCatapult,
  IsWall,
  IsProjectile,
  IsBoulder,
  Position,
  Health,
} from '../core/traits'
import { WALL_POSITION, WALL_WIDTH } from '../core/actions'
import CharacterProxy from './CharacterProxy'
import ArrowProxy from './ArrowProxy'
import BoulderProxy from './BoulderProxy'
import WallSlots from './WallSlots'

interface UnitRendererProps {
  /** 守军拖拽按下回调（BattleFieldSpace 提供，内部判定兵种） */
  onDefenderDragStart?: (entity: Entity) => void
  /** WallSlot 拖拽落点 hover 回调 */
  onSlotOver?: (slotIndex: number | null) => void
  /** WallSlot 拖拽落点松开回调 */
  onSlotUp?: (slotIndex: number) => void
}

/**
 * 单位渲染器
 * 用 ECS 查询批量渲染所有战场实体：敌人、守军、城墙、抛射物、WallSlot
 */
export default function UnitRenderer({ onDefenderDragStart, onSlotOver, onSlotUp }: UnitRendererProps) {
  // 敌人弓手
  const enemyArchers = useQuery(IsEnemy, IsArcher, Position)
  // 敌人步兵（近战）
  const enemyInfantry = useQuery(IsEnemy, IsMelee, Position)
  // 敌人矛兵
  const enemySpearmen = useQuery(IsEnemy, IsSpearman, Position)
  // 守军弓手
  const defenderArchers = useQuery(IsDefender, IsArcher, Position)
  // 守军矛兵
  const defenderSpearmen = useQuery(IsDefender, IsSpearman, Position)
  // 守军投石车
  const defenderCatapults = useQuery(IsDefender, IsCatapult, Position)
  // 箭矢抛射物（排除石块）
  const projectiles = useQuery(IsProjectile, Position)
  // 石块抛射物
  const boulders = useQuery(IsBoulder, Position)
  // 城墙（单个实体）
  const wall = useQueryFirst(IsWall, Health)

  // 守军 onPointerDown 包装：仅传给守军，敌人不传
  const onDefenderPointerDown = onDefenderDragStart
    ? (entity: Entity) => (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        onDefenderDragStart(entity)
      }
    : undefined

  return (
    <group>
      {/* 城墙 */}
      {wall && (
        <mesh position={[WALL_POSITION.x, WALL_POSITION.y, WALL_POSITION.z]} castShadow receiveShadow>
          <boxGeometry args={[WALL_WIDTH, 4, 0.84]} />
          <meshStandardMaterial color="#a68b5b" />
        </mesh>
      )}

      {/* 城墙插槽占位平面（仅未占用 slot 显示） */}
      <WallSlots onSlotOver={onSlotOver ?? (() => {})} onSlotUp={onSlotUp ?? (() => {})} />

      {/* 敌人弓手（黄色） */}
      {enemyArchers.map((entity) => (
        <CharacterProxy key={entity.id()} entity={entity} color="#e6c200" />
      ))}

      {/* 敌人步兵（深灰） */}
      {enemyInfantry.map((entity) => (
        <CharacterProxy key={entity.id()} entity={entity} color="#3a3a3a" />
      ))}

      {/* 敌人矛兵（深红） */}
      {enemySpearmen.map((entity) => (
        <CharacterProxy key={entity.id()} entity={entity} color="#b33939" />
      ))}

      {/* 守军弓手（蓝色） */}
      {defenderArchers.map((entity) => (
        <CharacterProxy
          key={entity.id()}
          entity={entity}
          color="#4a90d9"
          onPointerDown={onDefenderPointerDown?.(entity)}
        />
      ))}

      {/* 守军矛兵（青金） */}
      {defenderSpearmen.map((entity) => (
        <CharacterProxy
          key={entity.id()}
          entity={entity}
          color="#4a9d8f"
          onPointerDown={onDefenderPointerDown?.(entity)}
        />
      ))}

      {/* 守军投石车（深棕） */}
      {defenderCatapults.map((entity) => (
        <CharacterProxy
          key={entity.id()}
          entity={entity}
          color="#6b4226"
          size={[0.6, 0.8, 0.6]}
          onPointerDown={onDefenderPointerDown?.(entity)}
        />
      ))}

      {/* 箭矢抛射物 */}
      {projectiles.map((entity) => (
        <ArrowProxy key={entity.id()} entity={entity} />
      ))}

      {/* 石块抛射物 */}
      {boulders.map((entity) => (
        <BoulderProxy key={entity.id()} entity={entity} />
      ))}
    </group>
  )
}
