import { trait } from 'koota'

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
