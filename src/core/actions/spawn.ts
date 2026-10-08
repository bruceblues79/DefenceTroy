import { createActions, type Entity } from 'koota'
import {
  Position,
  Velocity,
  Health,
  Attack,
  CanAttackUnits,
  CanAttackWall,
  Reward,
  Projectile,
  IsEnemy,
  IsDefender,
  IsWall,
  IsArcher,
  IsMelee,
  IsSpearBreaker,
  IsPikeman,
  IsRam,
  IsPrayer,
  IsProjectile,
  Targeting,
  UnitType,
} from '../traits'

// 战场常量
// 城墙 z：2026-09-27 从 2.95 下移到 3.45，利用竖屏底部留白。
// 注意：ENEMY_*_WALL_Z 是绝对 z 值，未随墙移动（有意保留，
// 攻城兵停战线后续可能单独微调）；移动城墙只增大停战点到城墙正面的视觉空隙，逻辑无距离校验。
export const WALL_POSITION = { x: 0, y: 0, z: 3.45 }
export const WALL_WIDTH = 4.5
// 城墙血量：归一化为 100，与全单位一致
export const WALL_HP = 100

// 敌方弓兵：攻击单位（range=6）+ 攻击城门（wallZ=-1.3）
// 攻间隔统一 1.5s；移速 0.9；伤害由 combat/damage.ts 百分比表提供
export const ENEMY_ARCHER_HP = 100
export const ENEMY_ARCHER_SPEED = 0.9
export const ENEMY_ARCHER_UNITS_RANGE = 6
export const ENEMY_ARCHER_UNITS_INTERVAL = 1.5
export const ENEMY_ARCHER_WALL_Z = -1.3
export const ENEMY_ARCHER_WALL_INTERVAL = 1.5
export const ENEMY_ARCHER_REWARD = 50

// 敌方攻城兵：只攻击城门（wallZ=1.95），近战
// 攻间隔 1.0s；移速 0.7；伤害由百分比表提供
export const ENEMY_SAPPER_HP = 100
export const ENEMY_SAPPER_SPEED = 0.7
export const ENEMY_SAPPER_WALL_Z = 1.95
export const ENEMY_SAPPER_WALL_INTERVAL = 1.0
export const ENEMY_SAPPER_REWARD = 50

// 敌方长枪兵：攻击单位（range=4.5）+ 攻击城门（wallZ=0.5）
// 攻间隔 1.5s；移速 1.2；伤害由百分比表提供
export const ENEMY_PIKEMAN_HP = 100
export const ENEMY_PIKEMAN_SPEED = 1.2
export const ENEMY_PIKEMAN_UNITS_RANGE = 4.5
export const ENEMY_PIKEMAN_UNITS_INTERVAL = 1.5
export const ENEMY_PIKEMAN_WALL_Z = 0.5
export const ENEMY_PIKEMAN_WALL_INTERVAL = 1.5
export const ENEMY_PIKEMAN_REWARD = 50

// 敌方攻城车：只攻击城门（wallZ=1.75），百分比砸墙
// 攻间隔 2s；移速 0.3；伤害由百分比表提供（对墙 5%）
export const ENEMY_RAM_HP = 100
export const ENEMY_RAM_SPEED = 0.3
export const ENEMY_RAM_WALL_Z = 1.75
export const ENEMY_RAM_WALL_INTERVAL = 2
export const ENEMY_RAM_REWARD = 100

// 敌方祷言师：走到 wallZ=-0.5 后吟唱，吟唱完成给己方随机 kind 攻速 buff
// 攻间隔 3s；施法动作 1.5s（开始瞬间触发 buff）；移速 0.4；不攻击单位/城墙（不进入 updateAttack 伤害结算）
export const ENEMY_PRAYER_HP = 100
export const ENEMY_PRAYER_SPEED = 0.4
export const ENEMY_PRAYER_WALL_Z = -0.5
export const ENEMY_PRAYER_INTERVAL = 3
export const ENEMY_PRAYER_CHANT = 1.5
export const ENEMY_PRAYER_REWARD = 50

// 守军弓兵：只攻击单位
// 射程 6.5 = 攻弓 6 + 0.5，略大于对手保证先手
export const DEFENDER_ARCHER_HP = 100
export const DEFENDER_ARCHER_UNITS_RANGE = 6.5
export const DEFENDER_ARCHER_UNITS_INTERVAL = 1.5

// 守军破矛兵：只攻击单位
// 射程 4.65 = 长枪兵 4.5 + 0.15，略大于对手保证先手
export const DEFENDER_SPEAR_BREAKER_HP = 100
export const DEFENDER_SPEAR_BREAKER_UNITS_RANGE = 4.65
export const DEFENDER_SPEAR_BREAKER_UNITS_INTERVAL = 1.5

export const PROJECTILE_SPEED = 15

// 抛射物发射/命中高度：角色身高约 1.5m，取 2/3 ≈ 1.0m（胸口）。
// Position.y 语义是脚底，所以发射点 = 发射者 y + 本值，命中点 = 目标 y + 本值。
export const UNIT_SHOOT_HEIGHT = 1.0

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
        interval: ENEMY_ARCHER_UNITS_INTERVAL,
      }),
      CanAttackWall({
        wallZ: ENEMY_ARCHER_WALL_Z,
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
        interval: ENEMY_SAPPER_WALL_INTERVAL,
      }),
      Reward({ value: ENEMY_SAPPER_REWARD }),
      UnitType({ kind: 'sapper' }),
      IsEnemy,
      IsMelee,
    )
  },

  /** 生成敌方长枪兵：攻击单位 + 攻击城门。速度 2×，抗弓箭 */
  spawnEnemyPikeman(x: number, z: number = ENEMY_SPAWN_Z) {
    return world.spawn(
      Position({ x, y: 0, z }),
      Velocity({ x: 0, y: 0, z: 0 }),
      Health({ current: ENEMY_PIKEMAN_HP, max: ENEMY_PIKEMAN_HP }),
      Attack(),
      CanAttackUnits({
        range: ENEMY_PIKEMAN_UNITS_RANGE,
        interval: ENEMY_PIKEMAN_UNITS_INTERVAL,
      }),
      CanAttackWall({
        wallZ: ENEMY_PIKEMAN_WALL_Z,
        interval: ENEMY_PIKEMAN_WALL_INTERVAL,
      }),
      Reward({ value: ENEMY_PIKEMAN_REWARD }),
      UnitType({ kind: 'pikeman' }),
      IsEnemy,
      IsPikeman,
    )
  },

  /** 生成敌方攻城车：只攻击城门（近战百分比）。厚血慢速，需集火 */
  spawnEnemyRam(x: number, z: number = ENEMY_SPAWN_Z) {
    return world.spawn(
      Position({ x, y: 0, z }),
      Velocity({ x: 0, y: 0, z: 0 }),
      Health({ current: ENEMY_RAM_HP, max: ENEMY_RAM_HP }),
      Attack(),
      CanAttackWall({
        wallZ: ENEMY_RAM_WALL_Z,
        interval: ENEMY_RAM_WALL_INTERVAL,
      }),
      Reward({ value: ENEMY_RAM_REWARD }),
      UnitType({ kind: 'ram' }),
      IsEnemy,
      IsRam,
    )
  },

  /** 生成敌方祷言师：走到 wallZ 后吟唱，给己方随机 kind 攻速 buff。不攻击墙/单位
   *  Attack 字段由 updateEnemyPrayerAI 自管；updateAttack 通过 IsPrayer early-return 跳过 */
  spawnEnemyPrayer(x: number, z: number = ENEMY_SPAWN_Z) {
    return world.spawn(
      Position({ x, y: 0, z }),
      Velocity({ x: 0, y: 0, z: 0 }),
      Health({ current: ENEMY_PRAYER_HP, max: ENEMY_PRAYER_HP }),
      Attack({ cooldown: ENEMY_PRAYER_INTERVAL, attackTimer: 0, isAttacking: false }),
      Reward({ value: ENEMY_PRAYER_REWARD }),
      UnitType({ kind: 'prayer' }),
      IsEnemy,
      IsPrayer,
    )
  },

  /** 生成守军弓手：只攻击单位。可选 hp 用于从兵营回收后重新部署（保留血量）。部署后先走满冷却再攻击 */
  spawnDefenderArcher(x: number, y: number = 2, z: number = WALL_POSITION.z, hp?: number) {
    return world.spawn(
      Position({ x, y, z }),
      Health({ current: hp ?? DEFENDER_ARCHER_HP, max: DEFENDER_ARCHER_HP }),
      Attack(),
      CanAttackUnits({
        range: DEFENDER_ARCHER_UNITS_RANGE,
        interval: DEFENDER_ARCHER_UNITS_INTERVAL,
      }),
      UnitType({ kind: 'archer' }),
      IsDefender,
      IsArcher,
    )
  },

  /** 生成守军破矛兵：只攻击单位。可选 hp 用于从兵营回收后重新部署（保留血量）。部署后先走满冷却再攻击
   *  射程 4.65 比长枪兵 4.5 略大（先手由此而来） */
  spawnDefenderSpearBreaker(x: number, y: number = 2, z: number = WALL_POSITION.z, hp?: number) {
    return world.spawn(
      Position({ x, y, z }),
      Health({ current: hp ?? DEFENDER_SPEAR_BREAKER_HP, max: DEFENDER_SPEAR_BREAKER_HP }),
      Attack(),
      CanAttackUnits({
        range: DEFENDER_SPEAR_BREAKER_UNITS_RANGE,
        interval: DEFENDER_SPEAR_BREAKER_UNITS_INTERVAL,
      }),
      UnitType({ kind: 'spearbreaker' }),
      IsDefender,
      IsSpearBreaker,
    )
  },

  /** 生成抛射物。damage 为命中伤害占目标 maxHP 的百分比（0-100），由调用方查表后传入 */
  spawnProjectile(fromEntity: Entity, targetEntity: Entity, damage: number, speed: number = PROJECTILE_SPEED) {
    const fromPos = fromEntity.get(Position)
    if (!fromPos) return null
    const kind = fromEntity.get(UnitType)?.kind ?? 'unknown'
    return world.spawn(
      Position({ x: fromPos.x, y: fromPos.y + UNIT_SHOOT_HEIGHT, z: fromPos.z }),
      Velocity({ x: 0, y: 0, z: 0 }),
      Projectile({ damage, speed, kind }),
      IsProjectile,
      Targeting(targetEntity),
    )
  },
}))
