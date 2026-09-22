import { trait } from 'koota'

// 兵种身份类型（用于克制系数矩阵，不等同于攻击方式标签 IsMelee）
export type UnitKind = 'archer' | 'spearman' | 'catapult' | 'infantry' | 'wall' | 'unknown'

// 兵种身份 trait：所有战斗实体必须挂载，缺失时 kind 默认为 'unknown'（倍率 x1.0）
export const UnitType = trait<{ kind: UnitKind }>({ kind: 'unknown' })

// 阵营标签
export const IsEnemy = trait()
export const IsDefender = trait()

// 建筑标签
export const IsWall = trait()

// 单位类型标签
export const IsArcher = trait()
export const IsMelee = trait()
export const IsSpearman = trait()
export const IsCatapult = trait()

// 抛射物标签
export const IsProjectile = trait()
export const IsBoulder = trait()

// 视觉效果标签（短命实体，由 updateEffects 倒计时销毁）
export const IsEffect = trait()
