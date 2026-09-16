import { createActions, type Entity } from 'koota'
import {
  Position,
  Velocity,
  Health,
  Attack,
  Projectile,
  IsEnemy,
  IsDefender,
  IsWall,
  IsArcher,
  IsProjectile,
  Targeting,
} from '../traits'

// 战场常量
export const WALL_POSITION = { x: 0, y: 0, z: 2.95 }
export const WALL_WIDTH = 4.5
export const WALL_HP = 500
export const WALL_ATTACK_LINE_Z = -1.8 // 敌人到达此 z 线即可攻击城墙

export const ENEMY_ARCHER_HP = 30
export const ENEMY_ARCHER_SPEED = 0.5
export const ENEMY_ARCHER_RANGE = 5
export const ENEMY_ARCHER_DAMAGE = 5
export const ENEMY_ARCHER_INTERVAL = 1.5
export const ENEMY_ARCHER_ATTACK_POINT = 0.8

export const DEFENDER_ARCHER_HP = 50
export const DEFENDER_ARCHER_RANGE = 6
export const DEFENDER_ARCHER_DAMAGE = 8
export const DEFENDER_ARCHER_INTERVAL = 1.2
export const DEFENDER_ARCHER_ATTACK_POINT = 0.6

export const PROJECTILE_SPEED = 15

// 城墙 9 个部署点位（x 坐标）
export const WALL_SLOTS = Array.from({ length: 9 }, (_, i) => {
  const halfWidth = WALL_WIDTH / 2
  const step = WALL_WIDTH / 8
  return -halfWidth + step * i
})

// 敌人生成点位（x 坐标，-2 到 2，0.5 平分，共 9 个）
export const ENEMY_SPAWN_X = Array.from({ length: 9 }, (_, i) => -2 + i * 0.5)
export const ENEMY_SPAWN_Z = -4.5

export const spawnActions = createActions((world) => ({
  /** 生成城墙实体 */
  spawnWall() {
    return world.spawn(
      Position({ x: WALL_POSITION.x, y: WALL_POSITION.y, z: WALL_POSITION.z }),
      Health({ current: WALL_HP, max: WALL_HP }),
      IsWall,
    )
  },

  /** 生成敌人弓手 */
  spawnEnemyArcher(x: number, z: number = ENEMY_SPAWN_Z) {
    return world.spawn(
      Position({ x, y: 0, z }),
      Velocity({ x: 0, y: 0, z: 0 }),
      Health({ current: ENEMY_ARCHER_HP, max: ENEMY_ARCHER_HP }),
      Attack({
        range: ENEMY_ARCHER_RANGE,
        damage: ENEMY_ARCHER_DAMAGE,
        interval: ENEMY_ARCHER_INTERVAL,
        attackPoint: ENEMY_ARCHER_ATTACK_POINT,
      }),
      IsEnemy,
      IsArcher,
    )
  },

  /** 生成守军弓手 */
  spawnDefenderArcher(x: number, y: number = 2.5, z: number = WALL_POSITION.z) {
    return world.spawn(
      Position({ x, y, z }),
      Health({ current: DEFENDER_ARCHER_HP, max: DEFENDER_ARCHER_HP }),
      Attack({
        range: DEFENDER_ARCHER_RANGE,
        damage: DEFENDER_ARCHER_DAMAGE,
        interval: DEFENDER_ARCHER_INTERVAL,
        attackPoint: DEFENDER_ARCHER_ATTACK_POINT,
      }),
      IsDefender,
      IsArcher,
    )
  },

  /** 生成抛射物 */
  spawnProjectile(fromEntity: Entity, targetEntity: Entity, damage: number, speed: number = PROJECTILE_SPEED) {
    const fromPos = fromEntity.get(Position)
    if (!fromPos) return null
    return world.spawn(
      Position({ x: fromPos.x, y: fromPos.y, z: fromPos.z }),
      Velocity({ x: 0, y: 0, z: 0 }),
      Projectile({ damage, speed }),
      IsProjectile,
      Targeting(targetEntity),
    )
  },
}))
