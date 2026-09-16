import { useQuery, useQueryFirst } from 'koota/react'
import {
  IsEnemy,
  IsDefender,
  IsArcher,
  IsWall,
  IsProjectile,
  Position,
  Health,
} from '../core/traits'
import CharacterProxy from './CharacterProxy'
import ArrowProxy from './ArrowProxy'
import { WALL_POSITION, WALL_WIDTH } from '../core/actions'

/**
 * 单位渲染器
 * 用 ECS 查询批量渲染所有战场实体：敌人、守军、城墙、抛射物
 */
export default function UnitRenderer() {
  // 敌人弓手
  const enemyArchers = useQuery(IsEnemy, IsArcher, Position)
  // 守军弓手
  const defenderArchers = useQuery(IsDefender, IsArcher, Position)
  // 抛射物
  const projectiles = useQuery(IsProjectile, Position)
  // 城墙（单个实体）
  const wall = useQueryFirst(IsWall, Health)

  return (
    <group>
      {/* 城墙 */}
      {wall && (
        <mesh position={[WALL_POSITION.x, WALL_POSITION.y, WALL_POSITION.z]} castShadow receiveShadow>
          <boxGeometry args={[WALL_WIDTH, 4, 0.84]} />
          <meshStandardMaterial color="#a68b5b" />
        </mesh>
      )}

      {/* 敌人弓手（黄色） */}
      {enemyArchers.map((entity) => (
        <CharacterProxy key={entity.id()} entity={entity} color="#e6c200" />
      ))}

      {/* 守军弓手（蓝色） */}
      {defenderArchers.map((entity) => (
        <CharacterProxy key={entity.id()} entity={entity} color="#4a90d9" />
      ))}

      {/* 抛射物（箭矢） */}
      {projectiles.map((entity) => (
        <ArrowProxy key={entity.id()} entity={entity} />
      ))}
    </group>
  )
}
