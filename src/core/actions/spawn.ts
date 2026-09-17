import { createActions, type Entity } from 'koota'
import {
  Position,
  Velocity,
  Health,
  Attack,
  CanAttackUnits,
  CanAttackWall,
  CanBombard,
  Projectile,
  IsEnemy,
  IsDefender,
  IsWall,
  IsArcher,
  IsMelee,
  IsSpearman,
  IsCatapult,
  IsProjectile,
  IsBoulder,
  Targeting,
} from '../traits'

// 战场常量
export const WALL_POSITION = { x: 0, y: 0, z: 2.95 }
export const WALL_WIDTH = 4.5
export const WALL_HP = 500

// 敌方弓兵：攻击单位（range=5）+ 攻击城门（wallZ=1）
export const ENEMY_ARCHER_HP = 30
export const ENEMY_ARCHER_SPEED = 0.5
export const ENEMY_ARCHER_UNITS_RANGE = 5
export const ENEMY_ARCHER_UNITS_DAMAGE = 5
export const ENEMY_ARCHER_UNITS_INTERVAL = 1.5
export const ENEMY_ARCHER_UNITS_ATTACK_POINT = 0.8
export const ENEMY_ARCHER_WALL_Z = 0.9
export const ENEMY_ARCHER_WALL_DAMAGE = 5
export const ENEMY_ARCHER_WALL_INTERVAL = 1.5
export const ENEMY_ARCHER_WALL_ATTACK_POINT = 0.8

// 敌方步兵：只攻击城门（wallZ=1.95），近战
export const ENEMY_INFANTRY_HP = 50
export const ENEMY_INFANTRY_SPEED = 0.8
export const ENEMY_INFANTRY_WALL_Z = 1.95
export const ENEMY_INFANTRY_WALL_DAMAGE = 8
export const ENEMY_INFANTRY_WALL_INTERVAL = 1.2
export const ENEMY_INFANTRY_WALL_ATTACK_POINT = 0.5

// 敌方矛兵：攻击单位（range=2.5，弓兵1/2）+ 攻击城门（wallZ=1.475）
export const ENEMY_SPEARMAN_HP = 40
export const ENEMY_SPEARMAN_SPEED = 0.6
export const ENEMY_SPEARMAN_UNITS_RANGE = 2.5
export const ENEMY_SPEARMAN_UNITS_DAMAGE = 12
export const ENEMY_SPEARMAN_UNITS_INTERVAL = 1.3
export const ENEMY_SPEARMAN_UNITS_ATTACK_POINT = 0.7
export const ENEMY_SPEARMAN_WALL_Z = 1.475
export const ENEMY_SPEARMAN_WALL_DAMAGE = 12
export const ENEMY_SPEARMAN_WALL_INTERVAL = 1.3
export const ENEMY_SPEARMAN_WALL_ATTACK_POINT = 0.7

// 守军弓兵：只攻击单位（range=6）
export const DEFENDER_ARCHER_HP = 50
export const DEFENDER_ARCHER_UNITS_RANGE = 6
export const DEFENDER_ARCHER_UNITS_DAMAGE = 8
export const DEFENDER_ARCHER_UNITS_INTERVAL = 1.2
export const DEFENDER_ARCHER_UNITS_ATTACK_POINT = 0.6

// 守军矛兵：只攻击单位（range=3，弓兵1/2）
export const DEFENDER_SPEARMAN_HP = 60
export const DEFENDER_SPEARMAN_UNITS_RANGE = 3
export const DEFENDER_SPEARMAN_UNITS_DAMAGE = 15
export const DEFENDER_SPEARMAN_UNITS_INTERVAL = 1.1
export const DEFENDER_SPEARMAN_UNITS_ATTACK_POINT = 0.6

// 守军投石车：自动周期轰炸 z=0 线，AOE 0.5m 半径
export const DEFENDER_CATAPULT_HP = 150
export const DEFENDER_CATAPULT_TARGET_Z = -1
export const DEFENDER_CATAPULT_RADIUS = 2
export const DEFENDER_CATAPULT_DAMAGE = 40
export const DEFENDER_CATAPULT_INTERVAL = 2
export const DEFENDER_CATAPULT_ATTACK_POINT = 0.5

export const PROJECTILE_SPEED = 15
export const BOULDER_SPEED = 8

// 城墙 9 个部署点位（x 坐标）
// 城墙宽 WALL_WIDTH，9 等分，单位站每格中心
// 每格宽 = WALL_WIDTH / 9，中心偏移半格
export const WALL_SLOTS = Array.from({ length: 9 }, (_, i) => {
  const halfWidth = WALL_WIDTH / 2
  const cellWidth = WALL_WIDTH / 9
  return -halfWidth + cellWidth / 2 + cellWidth * i
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

  /** 生成敌人弓手：攻击单位 + 攻击城门 */
  spawnEnemyArcher(x: number, z: number = ENEMY_SPAWN_Z) {
    return world.spawn(
      Position({ x, y: 0, z }),
      Velocity({ x: 0, y: 0, z: 0 }),
      Health({ current: ENEMY_ARCHER_HP, max: ENEMY_ARCHER_HP }),
      Attack(),
      CanAttackUnits({
        range: ENEMY_ARCHER_UNITS_RANGE,
        damage: ENEMY_ARCHER_UNITS_DAMAGE,
        interval: ENEMY_ARCHER_UNITS_INTERVAL,
        attackPoint: ENEMY_ARCHER_UNITS_ATTACK_POINT,
      }),
      CanAttackWall({
        wallZ: ENEMY_ARCHER_WALL_Z,
        damage: ENEMY_ARCHER_WALL_DAMAGE,
        interval: ENEMY_ARCHER_WALL_INTERVAL,
        attackPoint: ENEMY_ARCHER_WALL_ATTACK_POINT,
      }),
      IsEnemy,
      IsArcher,
    )
  },

  /** 生成敌方步兵：只攻击城门（近战） */
  spawnEnemyInfantry(x: number, z: number = ENEMY_SPAWN_Z) {
    return world.spawn(
      Position({ x, y: 0, z }),
      Velocity({ x: 0, y: 0, z: 0 }),
      Health({ current: ENEMY_INFANTRY_HP, max: ENEMY_INFANTRY_HP }),
      Attack(),
      CanAttackWall({
        wallZ: ENEMY_INFANTRY_WALL_Z,
        damage: ENEMY_INFANTRY_WALL_DAMAGE,
        interval: ENEMY_INFANTRY_WALL_INTERVAL,
        attackPoint: ENEMY_INFANTRY_WALL_ATTACK_POINT,
      }),
      IsEnemy,
      IsMelee,
    )
  },

  /** 生成敌方矛兵：攻击单位 + 攻击城门 */
  spawnEnemySpearman(x: number, z: number = ENEMY_SPAWN_Z) {
    return world.spawn(
      Position({ x, y: 0, z }),
      Velocity({ x: 0, y: 0, z: 0 }),
      Health({ current: ENEMY_SPEARMAN_HP, max: ENEMY_SPEARMAN_HP }),
      Attack(),
      CanAttackUnits({
        range: ENEMY_SPEARMAN_UNITS_RANGE,
        damage: ENEMY_SPEARMAN_UNITS_DAMAGE,
        interval: ENEMY_SPEARMAN_UNITS_INTERVAL,
        attackPoint: ENEMY_SPEARMAN_UNITS_ATTACK_POINT,
      }),
      CanAttackWall({
        wallZ: ENEMY_SPEARMAN_WALL_Z,
        damage: ENEMY_SPEARMAN_WALL_DAMAGE,
        interval: ENEMY_SPEARMAN_WALL_INTERVAL,
        attackPoint: ENEMY_SPEARMAN_WALL_ATTACK_POINT,
      }),
      IsEnemy,
      IsSpearman,
    )
  },

  /** 生成守军弓手：只攻击单位 */
  spawnDefenderArcher(x: number, y: number = 2.5, z: number = WALL_POSITION.z) {
    return world.spawn(
      Position({ x, y, z }),
      Health({ current: DEFENDER_ARCHER_HP, max: DEFENDER_ARCHER_HP }),
      Attack(),
      CanAttackUnits({
        range: DEFENDER_ARCHER_UNITS_RANGE,
        damage: DEFENDER_ARCHER_UNITS_DAMAGE,
        interval: DEFENDER_ARCHER_UNITS_INTERVAL,
        attackPoint: DEFENDER_ARCHER_UNITS_ATTACK_POINT,
      }),
      IsDefender,
      IsArcher,
    )
  },

  /** 生成守军矛兵：只攻击单位 */
  spawnDefenderSpearman(x: number, y: number = 2.5, z: number = WALL_POSITION.z) {
    return world.spawn(
      Position({ x, y, z }),
      Health({ current: DEFENDER_SPEARMAN_HP, max: DEFENDER_SPEARMAN_HP }),
      Attack(),
      CanAttackUnits({
        range: DEFENDER_SPEARMAN_UNITS_RANGE,
        damage: DEFENDER_SPEARMAN_UNITS_DAMAGE,
        interval: DEFENDER_SPEARMAN_UNITS_INTERVAL,
        attackPoint: DEFENDER_SPEARMAN_UNITS_ATTACK_POINT,
      }),
      IsDefender,
      IsSpearman,
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

  /** 生成守军投石车：自动周期轰炸 */
  spawnDefenderCatapult(x: number, y: number = 2.5, z: number = WALL_POSITION.z) {
    return world.spawn(
      Position({ x, y, z }),
      Health({ current: DEFENDER_CATAPULT_HP, max: DEFENDER_CATAPULT_HP }),
      Attack(),
      CanBombard({
        targetZ: DEFENDER_CATAPULT_TARGET_Z,
        radius: DEFENDER_CATAPULT_RADIUS,
        damage: DEFENDER_CATAPULT_DAMAGE,
        interval: DEFENDER_CATAPULT_INTERVAL,
        attackPoint: DEFENDER_CATAPULT_ATTACK_POINT,
      }),
      IsDefender,
      IsCatapult,
    )
  },

  /** 生成石块抛射物（AOE，非追踪） */
  spawnBoulder(fromEntity: Entity, targetZ: number, radius: number, damage: number, speed: number = BOULDER_SPEED) {
    const fromPos = fromEntity.get(Position)
    if (!fromPos) return null
    return world.spawn(
      Position({ x: fromPos.x, y: fromPos.y, z: fromPos.z }),
      Velocity({ x: 0, y: 0, z: 0 }),
      Projectile({ damage, speed, targetZ, aoeRadius: radius }),
      IsBoulder,
    )
  },
}))
