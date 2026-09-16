import { trait } from 'koota'

/**
 * 攻击状态机（与目标类型无关）
 * cooldown: 剩余冷却（秒）
 * attackTimer: 当前攻击已进行时间（秒）
 * isAttacking: 是否正在攻击动画中
 * hasFired: 当前攻击是否已触发伤害/抛射物
 */
export const Attack = trait({
  cooldown: 0,
  attackTimer: 0,
  isAttacking: false,
  hasFired: false,
})

/**
 * 攻击对方阵营单位的能力参数
 * range: 攻击射程（米）
 * damage: 每次伤害
 * interval: 完整攻击周期（秒）
 * attackPoint: 攻击触发点（秒）
 */
export const CanAttackUnits = trait({
  range: 5,
  damage: 5,
  interval: 1.5,
  attackPoint: 0.8,
})

/**
 * 攻击城门的能力参数
 * wallZ: 攻城 z 位置，pos.z >= wallZ 时停止并攻击城墙
 * damage: 每次伤害
 * interval: 完整攻击周期（秒）
 * attackPoint: 攻击触发点（秒）
 */
export const CanAttackWall = trait({
  wallZ: 1.95,
  damage: 8,
  interval: 1.2,
  attackPoint: 0.5,
})
