import { trait } from 'koota'

/**
 * 攻击状态机（与目标类型无关）
 * cooldown: 剩余冷却（秒）
 * attackTimer: 当前攻击已进行时间（秒）
 * isAttacking: 是否正在攻击周期中
 */
export const Attack = trait({
  cooldown: 0,
  attackTimer: 0,
  isAttacking: false,
})

/**
 * 攻击对方阵营单位的能力参数
 * range: 攻击射程（米）
 * damage: 每次伤害
 * interval: 完整攻击周期（秒）
 * firstStrike: 先手距离（米）——在 range 之外额外获得的锁定范围，用于实现「射程相同也比对手
 *   早一击」。守方专属：攻城方靠冲脸，守方靠先手，所以只有守方配置非零值。
 *   取值 = 目标速度 × 自身 interval 时恰好先手一击（再大就会变成两击）。
 */
export const CanAttackUnits = trait({
  range: 5,
  damage: 5,
  interval: 1.5,
  firstStrike: 0,
})

/**
 * 攻击城门的能力参数
 * wallZ: 攻城 z 位置，pos.z >= wallZ 时停止并攻击城墙
 * damage: 每次伤害
 * interval: 完整攻击周期（秒）
 */
export const CanAttackWall = trait({
  wallZ: 1.95,
  damage: 8,
  interval: 1.2,
})

/**
 * 投石车轰炸能力
 * targetZ: 石块落地 z 坐标
 * radius: AOE 伤害半径
 * damage: 每次伤害
 * interval: 完整攻击周期（秒）
 */
export const CanBombard = trait({
  targetZ: 0,
  radius: 0.5,
  damage: 40,
  interval: 2,
})

/**
 * 被击杀奖励金币数
 */
export const Reward = trait({ value: 0 })
