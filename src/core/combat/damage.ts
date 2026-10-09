import type { Entity } from 'koota'
import { IsDefender, IsEnemy, IsWall, UnitType, type UnitKind } from '../traits'

/**
 * 伤害百分比表（伤害 = 目标 maxHP 的百分比）
 *
 * 按攻击方阵营拆分为两张表，因为同一 kind（如 archer）在敌我双方的伤害不同：
 * - ENEMY_DAMAGE：敌方攻击守军/城墙（攻击方为敌军，目标为守军或城墙）
 * - DEFENDER_DAMAGE：守方攻击敌军（攻击方为守军，目标为敌军）
 *
 * 查表规则：按目标阵营分支
 * - 目标为守军或城墙 → ENEMY_DAMAGE[攻击方kind][目标kind]
 * - 目标为敌军 → DEFENDER_DAMAGE[攻击方kind][目标kind]
 * - 未命中 → 0（不造成伤害）
 */

// 敌方攻击守军/城墙（行：攻击方兵种；列：受击方兵种；值：目标 maxHP 百分比）
const ENEMY_DAMAGE: Partial<Record<UnitKind, Partial<Record<UnitKind, number>>>> = {
  archer:  { archer: 10, spearbreaker: 7.5, wall: 0.25 },   // 敌弓
  pikeman: { archer: 12.5, spearbreaker: 10, wall: 0.25 },    // 敌矛
  sapper:  { wall: 0.05 },                                     // 敌步（只攻墙）
  ram:     { wall: 5 },                                        // 敌攻城（只攻墙）
}

// 守方攻击敌军（行：攻击方兵种；列：受击方兵种；值：目标 maxHP 百分比）
const DEFENDER_DAMAGE: Partial<Record<UnitKind, Partial<Record<UnitKind, number>>>> = {
  archer:       { sapper: 12.5, archer: 10, pikeman: 10, ram: 2, prayer: 4 },   // 守弓
  spearbreaker: { sapper: 12.5, archer: 20, pikeman: 12.5, ram: 2, prayer: 4 },  // 破矛
}

/**
 * 获取攻击方对目标的伤害百分比（0-100）
 * 按目标阵营选择伤害表：目标为守军/城墙查 ENEMY_DAMAGE，目标为敌军查 DEFENDER_DAMAGE
 */
export function getDamagePercentage(
  sourceKind: UnitKind | undefined,
  target: Entity | undefined,
): number {
  if (!sourceKind || !target) return 0
  const targetKind = target.get(UnitType)?.kind ?? 'unknown'
  const matrix = target.has(IsDefender) || target.has(IsWall) ? ENEMY_DAMAGE
              : target.has(IsEnemy) ? DEFENDER_DAMAGE
              : null
  return matrix?.[sourceKind]?.[targetKind] ?? 0
}
