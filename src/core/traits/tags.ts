import { trait } from 'koota'

// 兵种身份类型（用于克制系数矩阵，不等同于攻击方式标签 IsMelee）
// 阵营语义（同一 kind 不会跨阵营复用，命名以「守方视角」为准）：
//   'archer'   弓兵（双方都有，标准体 baseline）
//   'spearman' 守方「破矛兵」——专克矛骑士，射程短够不到攻弓
//   'cavalry'  攻方「矛骑士」——速度 2×，抗弓箭
//   'sapper'   攻方「攻城兵」——只攻墙，作用是干扰/分散火力/送钱
//   'catapult' 守方投石车
export type UnitKind = 'archer' | 'spearman' | 'cavalry' | 'catapult' | 'sapper' | 'wall' | 'unknown'

// 兵种身份 trait：所有战斗实体必须挂载，缺失时 kind 默认为 'unknown'（倍率 x1.0）
export const UnitType = trait<{ kind: UnitKind }>({ kind: 'unknown' })

// 阵营标签
export const IsEnemy = trait()
export const IsDefender = trait()

// 建筑标签
export const IsWall = trait()

// 单位类型标签
export const IsArcher = trait()
export const IsMelee = trait()          // 攻击方式：近战直扣血。目前仅攻方攻城兵挂载
export const IsSpearBreaker = trait()   // 守方破矛兵
export const IsCavalry = trait()        // 攻方矛骑士
export const IsCatapult = trait()

// 抛射物标签
export const IsProjectile = trait()
export const IsBoulder = trait()

// 视觉效果标签（短命实体，由 updateEffects 倒计时销毁）
export const IsEffect = trait()
