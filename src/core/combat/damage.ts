import type { UnitKind } from '../traits'

/**
 * 兵种克制系数矩阵
 * 行：攻击方兵种；列：受击方兵种；值：最终伤害倍率
 *
 * 设计规则：
 * - 同类互打：x1.0
 * - 次要克制：x1.25
 * - 最强克制：x1.5
 * - 对城墙伤害：始终 x1.0（wall 列全为 1）
 * - 未知来源/目标：x1.0（unknown 行列全为 1）
 */
const DAMAGE_MULTIPLIER: Record<UnitKind, Record<UnitKind, number>> = {
  archer:   { archer: 1,    spearman: 1.5,  infantry: 1.25, catapult: 1.25, wall: 1, unknown: 1 },
  spearman: { archer: 1.25, spearman: 1,    infantry: 1.5,  catapult: 1.25, wall: 1, unknown: 1 },
  catapult: { archer: 1.5,  spearman: 1.25, infantry: 1.25, catapult: 1,    wall: 1, unknown: 1 },
  infantry: { archer: 1.25, spearman: 1.25, infantry: 1,    catapult: 1.5,  wall: 1, unknown: 1 },
  wall:     { archer: 1,    spearman: 1,    infantry: 1,    catapult: 1,    wall: 1, unknown: 1 },
  unknown:  { archer: 1,    spearman: 1,    infantry: 1,    catapult: 1,    wall: 1, unknown: 1 },
}

/** 获取克制倍率。来源或目标缺失时按 unknown 处理（x1.0）。 */
export function getDamageMultiplier(
  sourceKind: UnitKind | undefined,
  targetKind: UnitKind | undefined,
): number {
  return DAMAGE_MULTIPLIER[sourceKind ?? 'unknown']?.[targetKind ?? 'unknown'] ?? 1
}

/** 最终伤害 = 基础伤害 × 克制倍率 */
export function calculateDamage(
  sourceKind: UnitKind | undefined,
  targetKind: UnitKind | undefined,
  baseDamage: number,
): number {
  return baseDamage * getDamageMultiplier(sourceKind, targetKind)
}
