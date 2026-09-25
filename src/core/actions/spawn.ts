import { createActions, type Entity } from 'koota'
import {
  Position,
  Velocity,
  Health,
  Attack,
  CanAttackUnits,
  CanAttackWall,
  CanBombard,
  Reward,
  Projectile,
  IsEnemy,
  IsDefender,
  IsWall,
  IsArcher,
  IsMelee,
  IsSpearBreaker,
  IsCavalry,
  IsCatapult,
  IsProjectile,
  IsBoulder,
  Targeting,
  UnitType,
} from '../traits'

// 战场常量
export const WALL_POSITION = { x: 0, y: 0, z: 2.95 }
export const WALL_WIDTH = 4.5
// 城墙血量：有意设为近乎不可破，因此失败判定实际只走「守军全灭 + 兵营为空」这条路径。
// 这是暂时性数值，等城墙攻防玩法定稿后再回填真实值 —— 不是 bug，不要顺手改小。
export const WALL_HP = 99999

// 敌方弓兵：攻击单位（range=5）+ 攻击城门（wallZ=-0.6）
export const ENEMY_ARCHER_HP = 200
export const ENEMY_ARCHER_SPEED = 0.6
export const ENEMY_ARCHER_UNITS_RANGE = 5
export const ENEMY_ARCHER_UNITS_DAMAGE = 24
export const ENEMY_ARCHER_UNITS_INTERVAL = 1.2
export const ENEMY_ARCHER_WALL_Z = -0.6
export const ENEMY_ARCHER_WALL_DAMAGE = 1.2
export const ENEMY_ARCHER_WALL_INTERVAL = 1.2
export const ENEMY_ARCHER_REWARD = 60

// 敌方攻城兵：只攻击城门（wallZ=1.95），近战
// 定位：干扰 + 分散守军火力 + 送钱。不主动攻击守军，但会吸引守军自动索敌，
// 混合波时逼玩家手动指定优先目标
export const ENEMY_SAPPER_HP = 200
export const ENEMY_SAPPER_SPEED = 0.4
export const ENEMY_SAPPER_WALL_Z = 1.95
export const ENEMY_SAPPER_WALL_DAMAGE = 1
export const ENEMY_SAPPER_WALL_INTERVAL = 1.0
export const ENEMY_SAPPER_REWARD = 60

// 敌方矛骑士：攻击单位（range=2.5）+ 攻击城门（wallZ=0.825）
// 速度 = 弓兵 2×（0.6 → 1.2）；抗弓箭（守弓打他 ×0.25，见 combat/damage.ts）
export const ENEMY_CAVALRY_HP = 200
export const ENEMY_CAVALRY_SPEED = 1.2
export const ENEMY_CAVALRY_UNITS_RANGE = 2.5
export const ENEMY_CAVALRY_UNITS_DAMAGE = 32
export const ENEMY_CAVALRY_UNITS_INTERVAL = 1.6
export const ENEMY_CAVALRY_WALL_Z = 0.825
export const ENEMY_CAVALRY_WALL_DAMAGE = 1.6
export const ENEMY_CAVALRY_WALL_INTERVAL = 1.6
export const ENEMY_CAVALRY_REWARD = 60

// 守军弓兵：只攻击单位
// 射程 5.7 = 攻弓 5.0 + 0.7。这 0.7 米是对手走到自己射程前守弓多打一箭的距离，
// 0.7 < 攻弓速度 0.6 × 间隔 1.2 = 0.72，所以恰好一箭（再大就变两箭）。
// 守方优势只体现在射程比对手略大，不改攻速、不加先手机制。
export const DEFENDER_ARCHER_HP = 200
export const DEFENDER_ARCHER_UNITS_RANGE = 5.7
export const DEFENDER_ARCHER_UNITS_DAMAGE = 24
export const DEFENDER_ARCHER_UNITS_INTERVAL = 1.2

// 守军破矛兵：只攻击单位
// 射程 3.3 = 矛骑士 2.5 + 0.8，同样只是「比对手远一点」，先手由此自然产生。
// ⚠️ 上限被「不能碰到攻弓」卡死：攻弓纵深 3.55，所以 3.3 已经贴着上限（余量 0.25）。
//    任何调大此值的改动都要先验算 < 3.55，否则破矛兵够得到攻弓，「专而不强」失效。
export const DEFENDER_SPEAR_BREAKER_HP = 200
export const DEFENDER_SPEAR_BREAKER_UNITS_RANGE = 3.3
export const DEFENDER_SPEAR_BREAKER_UNITS_DAMAGE = 32
export const DEFENDER_SPEAR_BREAKER_UNITS_INTERVAL = 1.2

// 守军投石车：自动周期轰炸 z=-1 线，AOE 1.25m 半径
export const DEFENDER_CATAPULT_HP = 200
export const DEFENDER_CATAPULT_TARGET_Z = -1
export const DEFENDER_CATAPULT_RADIUS = 1.5
export const DEFENDER_CATAPULT_DAMAGE = 40
export const DEFENDER_CATAPULT_INTERVAL = 2

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
      UnitType({ kind: 'wall' }),
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
      }),
      CanAttackWall({
        wallZ: ENEMY_ARCHER_WALL_Z,
        damage: ENEMY_ARCHER_WALL_DAMAGE,
        interval: ENEMY_ARCHER_WALL_INTERVAL,
      }),
      Reward({ value: ENEMY_ARCHER_REWARD }),
      UnitType({ kind: 'archer' }),
      IsEnemy,
      IsArcher,
    )
  },

  /** 生成敌方攻城兵：只攻击城门（近战）。干扰/送钱型，不主动攻击守军 */
  spawnEnemySapper(x: number, z: number = ENEMY_SPAWN_Z) {
    return world.spawn(
      Position({ x, y: 0, z }),
      Velocity({ x: 0, y: 0, z: 0 }),
      Health({ current: ENEMY_SAPPER_HP, max: ENEMY_SAPPER_HP }),
      Attack(),
      CanAttackWall({
        wallZ: ENEMY_SAPPER_WALL_Z,
        damage: ENEMY_SAPPER_WALL_DAMAGE,
        interval: ENEMY_SAPPER_WALL_INTERVAL,
      }),
      Reward({ value: ENEMY_SAPPER_REWARD }),
      UnitType({ kind: 'sapper' }),
      IsEnemy,
      IsMelee,
    )
  },

  /** 生成敌方矛骑士：攻击单位 + 攻击城门。速度 2×，抗弓箭 */
  spawnEnemyCavalry(x: number, z: number = ENEMY_SPAWN_Z) {
    return world.spawn(
      Position({ x, y: 0, z }),
      Velocity({ x: 0, y: 0, z: 0 }),
      Health({ current: ENEMY_CAVALRY_HP, max: ENEMY_CAVALRY_HP }),
      Attack(),
      CanAttackUnits({
        range: ENEMY_CAVALRY_UNITS_RANGE,
        damage: ENEMY_CAVALRY_UNITS_DAMAGE,
        interval: ENEMY_CAVALRY_UNITS_INTERVAL,
      }),
      CanAttackWall({
        wallZ: ENEMY_CAVALRY_WALL_Z,
        damage: ENEMY_CAVALRY_WALL_DAMAGE,
        interval: ENEMY_CAVALRY_WALL_INTERVAL,
      }),
      Reward({ value: ENEMY_CAVALRY_REWARD }),
      UnitType({ kind: 'cavalry' }),
      IsEnemy,
      IsCavalry,
    )
  },

  /** 生成守军弓手：只攻击单位。可选 hp 用于从兵营回收后重新部署（保留血量）。部署后先走满冷却再攻击 */
  spawnDefenderArcher(x: number, y: number = 2.5, z: number = WALL_POSITION.z, hp?: number) {
    return world.spawn(
      Position({ x, y, z }),
      Health({ current: hp ?? DEFENDER_ARCHER_HP, max: DEFENDER_ARCHER_HP }),
      Attack(),
      CanAttackUnits({
        range: DEFENDER_ARCHER_UNITS_RANGE,
        damage: DEFENDER_ARCHER_UNITS_DAMAGE,
        interval: DEFENDER_ARCHER_UNITS_INTERVAL,
      }),
      UnitType({ kind: 'archer' }),
      IsDefender,
      IsArcher,
    )
  },

  /** 生成守军破矛兵：只攻击单位。可选 hp 用于从兵营回收后重新部署（保留血量）。部署后先走满冷却再攻击
   *  射程 3.3 比矛骑士 2.5 略大（先手由此而来），但仍够不到攻弓（纵深 3.55） */
  spawnDefenderSpearBreaker(x: number, y: number = 2.5, z: number = WALL_POSITION.z, hp?: number) {
    return world.spawn(
      Position({ x, y, z }),
      Health({ current: hp ?? DEFENDER_SPEAR_BREAKER_HP, max: DEFENDER_SPEAR_BREAKER_HP }),
      Attack(),
      CanAttackUnits({
        range: DEFENDER_SPEAR_BREAKER_UNITS_RANGE,
        damage: DEFENDER_SPEAR_BREAKER_UNITS_DAMAGE,
        interval: DEFENDER_SPEAR_BREAKER_UNITS_INTERVAL,
      }),
      UnitType({ kind: 'spearman' }),
      IsDefender,
      IsSpearBreaker,
    )
  },

  /** 生成抛射物 */
  spawnProjectile(fromEntity: Entity, targetEntity: Entity, damage: number, speed: number = PROJECTILE_SPEED) {
    const fromPos = fromEntity.get(Position)
    if (!fromPos) return null
    const sourceKind = fromEntity.get(UnitType)?.kind ?? 'unknown'
    return world.spawn(
      Position({ x: fromPos.x, y: fromPos.y, z: fromPos.z }),
      Velocity({ x: 0, y: 0, z: 0 }),
      Projectile({ damage, speed, sourceKind }),
      IsProjectile,
      Targeting(targetEntity),
    )
  },

  /** 生成守军投石车：自动周期轰炸。可选 hp 用于从兵营回收后重新部署（保留血量）。部署后先走满冷却再攻击 */
  spawnDefenderCatapult(x: number, y: number = 2.5, z: number = WALL_POSITION.z, hp?: number) {
    return world.spawn(
      Position({ x, y, z }),
      Health({ current: hp ?? DEFENDER_CATAPULT_HP, max: DEFENDER_CATAPULT_HP }),
      Attack(),
      CanBombard({
        targetZ: DEFENDER_CATAPULT_TARGET_Z,
        radius: DEFENDER_CATAPULT_RADIUS,
        damage: DEFENDER_CATAPULT_DAMAGE,
        interval: DEFENDER_CATAPULT_INTERVAL,
      }),
      UnitType({ kind: 'catapult' }),
      IsDefender,
      IsCatapult,
    )
  },

  /** 生成石块抛射物（AOE，非追踪） */
  spawnBoulder(fromEntity: Entity, targetZ: number, radius: number, damage: number, speed: number = BOULDER_SPEED) {
    const fromPos = fromEntity.get(Position)
    if (!fromPos) return null
    const sourceKind = fromEntity.get(UnitType)?.kind ?? 'unknown'
    return world.spawn(
      Position({ x: fromPos.x, y: fromPos.y, z: fromPos.z }),
      Velocity({ x: 0, y: 0, z: 0 }),
      Projectile({ damage, speed, targetZ, aoeRadius: radius, sourceKind }),
      IsBoulder,
    )
  },
}))
