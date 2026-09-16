import { trait } from 'koota'

/**
 * 攻击组件
 * range: 攻击射程（米）
 * damage: 每次伤害
 * interval: 完整攻击周期（秒）
 * attackPoint: 攻击触发点（秒，从攻击开始计时）
 * cooldown: 剩余冷却（秒）
 * attackTimer: 当前攻击已进行时间（秒）
 * isAttacking: 是否正在攻击动画中
 * hasFired: 当前攻击是否已发射抛射物
 */
export const Attack = trait({
  range: 5,
  damage: 5,
  interval: 1.5,
  attackPoint: 0.8,
  cooldown: 0,
  attackTimer: 0,
  isAttacking: false,
  hasFired: false,
})
