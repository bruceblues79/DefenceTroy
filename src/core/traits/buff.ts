import { trait } from 'koota'

/**
 * 攻速 buff 数据
 * - multiplier: 攻击间隔乘数（0.5 = 缩短 50%）
 * - remaining: 剩余时长（秒），由 updateAttackSpeedBuff 每帧递减，<=0 时移除 trait
 *
 * 由祷言师吟唱完成时挂到攻方单位（sapper/archer/pikeman/ram 之一）上，
 * attack.ts 的 getInterval 读取后 interval *= multiplier。
 */
export const AttackSpeedBuff = trait({
  multiplier: 1,
  remaining: 0,
})
