import { trait } from 'koota'
import type { UnitKind } from './tags'

/**
 * 抛射物参数
 * damage: 命中伤害
 * speed: 飞行速度
 * sourceKind: 发射者兵种身份（用于克制系数矩阵；发射者死亡不影响已射出抛射物）
 */
export const Projectile = trait({
  damage: 5,
  speed: 15,
  sourceKind: 'unknown' as UnitKind,
})
