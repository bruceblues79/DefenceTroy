import { trait } from 'koota'

/**
 * 攻击状态机（与目标类型无关）
 * cooldown: 剩余冷却（秒）
 * attackTimer: 当前攻击已进行时间（秒）
 * isAttacking: 是否正在攻击周期中
 * currentInterval: 本次攻击触发时记录的周期（秒），isAttacking 期间不重新查 target，
 *   避免 target 中途死亡时 getInterval=0 立即结束 atk，让动作完整播放
 */
export const Attack = trait({
  cooldown: 0,
  attackTimer: 0,
  isAttacking: false,
  currentInterval: 0,
})

/**
 * 攻击对方阵营单位的能力参数
 * range: 攻击射程（米）
 * interval: 完整攻击周期（秒）
 * 伤害不在此 trait 存储，改由 combat/damage.ts 的百分比表按兵种组合查表
 *
 * 守方的「先手一击」不靠独立机制实现：守方 range 本身就比对手略大一点点
 * （守弓 6.5 vs 攻弓 6、破矛兵 4.65 vs 长枪兵 4.5），先手是射程差的自然结果。
 */
export const CanAttackUnits = trait({
  range: 5,
  interval: 1.5,
})

/**
 * 攻击城门的能力参数
 * wallZ: 攻城 z 位置，pos.z >= wallZ 时停止并攻击城墙
 * interval: 完整攻击周期（秒）
 * 伤害不在此 trait 存储，改由 combat/damage.ts 的百分比表按兵种组合查表（统一为目标 maxHP 百分比）
 */
export const CanAttackWall = trait({
  wallZ: 1.95,
  interval: 1.2,
})

/**
 * 被击杀奖励金币数
 */
export const Reward = trait({ value: 0 })
