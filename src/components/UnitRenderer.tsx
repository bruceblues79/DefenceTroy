import { useQuery, useQueryFirst } from 'koota/react'
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
import CharacterProxy from './CharacterProxy'
import ArrowProxy from './ArrowProxy'
import BoulderProxy from './BoulderProxy'
import { WALL_POSITION, WALL_WIDTH } from '../core/actions'

/**
 * 单位渲染器
 * 用 ECS 查询批量渲染所有战场实体：敌人、守军、城墙、抛射物
 */
export default function UnitRenderer() {
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
        <CharacterProxy key={entity.id()} entity={entity} color="#4a90d9" />
      ))}

      {/* 守军矛兵（青金） */}
      {defenderSpearmen.map((entity) => (
        <CharacterProxy key={entity.id()} entity={entity} color="#4a9d8f" />
      ))}

      {/* 守军投石车（深棕） */}
      {defenderCatapults.map((entity) => (
        <CharacterProxy key={entity.id()} entity={entity} color="#6b4226" size={[0.6, 0.8, 0.6]} />
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
