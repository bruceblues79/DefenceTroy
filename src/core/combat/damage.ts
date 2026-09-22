import type { Entity } from 'koota'
import { IsDefender, IsEnemy, IsWall, UnitType, type UnitKind } from '../traits'

/**
 * 兵种克制系数矩阵（按阵营拆分，非对称）
 * 行：攻击方兵种；列：受击方兵种；值：最终伤害倍率
 *
 * 设计规则：
 * - 守军攻击敌军 → 查 DEFENDER_OFFENSE
 * - 敌军攻击守军 → 查 ENEMY_OFFENSE（敌步兵只攻墙，不在此表）
 * - 对城墙伤害：始终 x1.0
 * - 未知来源/目标：x1.0
 */

// 守军攻击敌军
const DEFENDER_OFFENSE: Partial<Record<UnitKind, Partial<Record<UnitKind, number>>>> = {
  archer:   { infantry: 1.5,  archer: 1.0,  spearman: 0.5  },
  spearman: { infantry: 1.0,  archer: 0.5,  spearman: 1.5  },
  catapult: { infantry: 0.75, archer: 1.5,  spearman: 1.0  },
}

// 敌军攻击守军
const ENEMY_OFFENSE: Partial<Record<UnitKind, Partial<Record<UnitKind, number>>>> = {
  archer:   { archer: 1.0,  spearman: 0.5,  catapult: 0.85 },
  spearman: { archer: 1.5,  spearman: 1.0,  catapult: 1.25 },
}

/**
 * 获取克制倍率。按目标阵营分支查表：
 * - 目标为城墙 → x1.0
 * - 目标为守军 → ENEMY_OFFENSE（攻击方必为敌军）
 * - 目标为敌军 → DEFENDER_OFFENSE（攻击方必为守军）
 * - 来源或目标缺失 → x1.0
 */
export function getDamageMultiplier(
  sourceKind: UnitKind | undefined,
  target: Entity | undefined,
): number {
  if (!sourceKind || !target) return 1
  if (target.has(IsWall)) return 1
  const targetKind = target.get(UnitType)?.kind ?? 'unknown'
  const matrix = target.has(IsDefender) ? ENEMY_OFFENSE
              : target.has(IsEnemy)     ? DEFENDER_OFFENSE
              : null
  return matrix?.[sourceKind]?.[targetKind] ?? 1
}

/** 最终伤害 = 基础伤害 × 克制倍率 */
export function calculateDamage(
  sourceKind: UnitKind | undefined,
  target: Entity | undefined,
  baseDamage: number,
): number {
  return baseDamage * getDamageMultiplier(sourceKind, target)
}
