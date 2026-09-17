import { trait } from 'koota'

/**
 * 一次性视觉效果数据
 * - remaining: 剩余时间（秒），由 updateEffects 每帧递减
 * - initial: 初始时长，用于计算 progress（淡出比例）
 * - radius: 视觉半径（米），与触发该 effect 的 AOE 半径一致
 */
export const Effect = trait({
  remaining: 0.5,
  initial: 0.5,
  radius: 1,
})
