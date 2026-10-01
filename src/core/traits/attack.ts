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
 *
 * 守方的「先手一击」不靠独立机制实现：守方 range 本身就比对手略大一点点
 * （守弓 5.7 vs 攻弓 5.0、破矛兵 3.3 vs 长枪兵 2.5），先手是射程差的自然结果。
 */
export const CanAttackUnits = trait({
  range: 5,
  damage: 5,
  interval: 1.5,
})

/**
 * 攻击城门的能力参数
 * wallZ: 攻城 z 位置，pos.z >= wallZ 时停止并攻击城墙
 * damage: 每次伤害（isPercent 为 true 时为百分比 0-100，按 target.max 计算）
 * interval: 完整攻击周期（秒）
 * isPercent: true 时 damage 按目标 maxHP 百分比结算（用于攻城车）
 */
export const CanAttackWall = trait({
  wallZ: 1.95,
  damage: 8,
  interval: 1.2,
  isPercent: false,
})

/**
 * 被击杀奖励金币数
 */
export const Reward = trait({ value: 0 })
