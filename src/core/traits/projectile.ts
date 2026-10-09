import { trait } from 'koota'
import type { UnitKind } from './tags'

/**
 * 抛射物参数
 * damage: 命中伤害占目标 maxHP 的百分比（0-100），发射时已按兵种组合查表解析
 * speed: 飞行速度
 * kind: 发射者兵种身份（仅用于视觉渲染：archer 射箭，其余投矛）
 */
export const Projectile = trait({
  damage: 5,
  speed: 15,
  kind: 'unknown' as UnitKind,
})
