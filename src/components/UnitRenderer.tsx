import { useQuery, useQueryFirst } from 'koota/react'
import { useCallback, useRef, useState } from 'react'
import type { Entity } from 'koota'
import { type ThreeEvent } from '@react-three/fiber'
import {
  IsEnemy,
  IsDefender,
  IsArcher,
  IsMelee,
  IsSpearBreaker,
  IsPikeman,
  IsCatapult,
  IsWall,
  IsProjectile,
  IsBoulder,
  Position,
  Health,
} from '../core/traits'
import { WALL_POSITION, WALL_WIDTH } from '../core/actions'
import CharacterProxy from './CharacterProxy'
import CharacterModel, { CorpseModel, MODEL_YAW, type DeathInfo, type ModelKey } from './CharacterModel'
import ArrowProxy from './ArrowProxy'
import BoulderProxy from './BoulderProxy'
import WallSlots from './WallSlots'
import HealthBarProxy from './HealthBarProxy'
import EffectProxy from './EffectProxy'

interface UnitRendererProps {
  /** 守军拖拽按下回调（BattleFieldSpace 提供，内部判定兵种） */
  onDefenderDragStart?: (entity: Entity) => void
  /** WallSlot 拖拽落点 hover 回调 */
  onSlotOver?: (slotIndex: number | null) => void
  /** WallSlot 拖拽落点松开回调 */
  onSlotUp?: (slotIndex: number) => void
  /** 拖拽松开在敌人身上回调（用于手动指定攻击目标） */
  onEnemyPointerUp?: (entity: Entity) => (e: ThreeEvent<PointerEvent>) => void
}

/**
 * 单位渲染器
 * 用 ECS 查询批量渲染所有战场实体：敌人、守军、城墙、抛射物、WallSlot
 */
export default function UnitRenderer({ onDefenderDragStart, onSlotOver, onSlotUp, onEnemyPointerUp }: UnitRendererProps) {
  // 尸体列表：实体被逻辑层销毁后，由渲染层接着播 die，播完移除
  const [corpses, setCorpses] = useState<(DeathInfo & { id: number })[]>([])
  const corpseId = useRef(0)
  const handleDeath = useCallback((info: DeathInfo) => {
    setCorpses((prev) => [...prev, { ...info, id: corpseId.current++ }])
  }, [])
  const removeCorpse = (id: number) => setCorpses((prev) => prev.filter((c) => c.id !== id))

  // 敌人弓手
  const enemyArchers = useQuery(IsEnemy, IsArcher, Position)
  // 敌人攻城兵（近战，只攻墙）
  const enemySappers = useQuery(IsEnemy, IsMelee, Position)
  // 敌人长枪兵
  const enemyPikeman = useQuery(IsEnemy, IsPikeman, Position)
  // 守军弓手
  const defenderArchers = useQuery(IsDefender, IsArcher, Position)
  // 守军破矛兵
  const defenderSpearBreakers = useQuery(IsDefender, IsSpearBreaker, Position)
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
        <>
          <mesh position={[WALL_POSITION.x, WALL_POSITION.y, WALL_POSITION.z]} castShadow receiveShadow>
            <boxGeometry args={[WALL_WIDTH, 4, 0.84]} />
            <meshStandardMaterial color="#a68b5b" />
          </mesh>
          {/* 城墙血条：z=3.5（按钮 z=4 与城墙 z=2.95 中点），y=2.5 浮空，细窄 */}
          <HealthBarProxy
            entity={wall}
            offset={[0, 2.5, 0.55]}
            width={4.3}
            height={0.08}
          />
        </>
      )}

      {/* 城墙插槽占位平面（仅未占用 slot 显示）；城墙被毁时随城墙一起消失 */}
      {wall && <WallSlots onSlotOver={onSlotOver ?? (() => {})} onSlotUp={onSlotUp ?? (() => {})} />}

      {/* 敌人弓手 */}
      {enemyArchers.map((entity) => (
        <group key={entity.id()}>
          <CharacterModel
            entity={entity}
            modelKey={'enemyArcher' as ModelKey}
            yaw={MODEL_YAW.enemyArcher}
            onPointerUp={onEnemyPointerUp?.(entity)}
            onDeath={handleDeath}
          />
          <HealthBarProxy entity={entity} offset={[0, 1.7, 0]} width={0.4} />
        </group>
      ))}

      {/* 敌人攻城兵 */}
      {enemySappers.map((entity) => (
        <group key={entity.id()}>
          <CharacterModel
            entity={entity}
            modelKey={'enemySapper' as ModelKey}
            yaw={MODEL_YAW.enemySapper}
            onPointerUp={onEnemyPointerUp?.(entity)}
            onDeath={handleDeath}
          />
          <HealthBarProxy entity={entity} offset={[0, 1.7, 0]} width={0.4} />
        </group>
      ))}

      {/* 敌人长枪兵 */}
      {enemyPikeman.map((entity) => (
        <group key={entity.id()}>
          <CharacterModel
            entity={entity}
            modelKey={'enemyPikeman' as ModelKey}
            yaw={MODEL_YAW.enemyPikeman}
            onPointerUp={onEnemyPointerUp?.(entity)}
            onDeath={handleDeath}
          />
          <HealthBarProxy entity={entity} offset={[0, 1.7, 0]} width={0.4} />
        </group>
      ))}

      {/* 守军弓手 */}
      {defenderArchers.map((entity) => (
        <group key={entity.id()}>
          <CharacterModel
            entity={entity}
            modelKey={'defenderArcher' as ModelKey}
            yaw={MODEL_YAW.defenderArcher}
            onPointerDown={onDefenderPointerDown?.(entity)}
            onDeath={handleDeath}
          />
          <HealthBarProxy entity={entity} offset={[0, 1.7, 0]} width={0.4} />
        </group>
      ))}

      {/* 守军破矛兵 */}
      {defenderSpearBreakers.map((entity) => (
        <group key={entity.id()}>
          <CharacterModel
            entity={entity}
            modelKey={'defenderSpearBreaker' as ModelKey}
            yaw={MODEL_YAW.defenderSpearBreaker}
            onPointerDown={onDefenderPointerDown?.(entity)}
            onDeath={handleDeath}
          />
          <HealthBarProxy entity={entity} offset={[0, 1.7, 0]} width={0.4} />
        </group>
      ))}

      {/* 守军投石车（深棕）盒子高 0.8，半高 0.4，血条 y = pos.y + 0.5 */}
      {defenderCatapults.map((entity) => (
        <group key={entity.id()}>
          <CharacterProxy
            entity={entity}
            color="#6b4226"
            size={[0.6, 0.8, 0.6]}
            onPointerDown={onDefenderPointerDown?.(entity)}
          />
          <HealthBarProxy entity={entity} offset={[0, 1.0, 0]} width={0.55} />
        </group>
      ))}

      {/* 尸体：播 die 后消失 */}
      {corpses.map((c) => (
        <CorpseModel
          key={c.id}
          modelKey={c.modelKey}
          position={c.position}
          yaw={c.yaw}
          onDone={() => removeCorpse(c.id)}
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

      {/* 视觉效果（AOE 命中圆片等） */}
      <EffectProxy />
    </group>
  )
}
