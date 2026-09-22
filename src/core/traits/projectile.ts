import { trait } from 'koota'
import type { UnitKind } from './tags'

/**
 * 抛射物参数
 * damage: 命中伤害
 * speed: 飞行速度
 * targetZ: 石块专用——落地 z 坐标（默认 0，普通抛射物不使用）
 * aoeRadius: 石块专用——AOE 半径（默认 0，普通抛射物不使用）
 * sourceKind: 发射者兵种身份（用于克制系数矩阵；发射者死亡不影响已射出抛射物）
 */
export const Projectile = trait({
  damage: 5,
  speed: 15,
  targetZ: 0,
  aoeRadius: 0,
  sourceKind: 'unknown' as UnitKind,
})
