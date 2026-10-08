import { trait } from 'koota'

// 兵种身份类型（用于克制系数矩阵，不等同于攻击方式标签 IsMelee）
// 阵营语义（同一 kind 不会跨阵营复用，命名以「守方视角」为准）：
//   'archer'   弓兵（双方都有，标准体 baseline）
//   'spearbreaker' 守方「破矛兵」——专克长枪兵，射程短够不到攻弓
//   'pikeman'  攻方「长枪兵」——速度 2×，抗弓箭
//   'sapper'   攻方「攻城兵」——只攻墙，作用是干扰/分散火力/送钱
//   'ram'      攻方「攻城车」——慢速厚血，百分比砸墙，需集火
//   'prayer'   攻方「祷言师」——走到停止位后吟唱，给己方随机 kind 攻速 buff
export type UnitKind = 'archer' | 'spearbreaker' | 'pikeman' | 'sapper' | 'ram' | 'prayer' | 'wall' | 'unknown'

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
export const IsPikeman = trait()        // 攻方长枪兵
export const IsRam = trait()            // 攻方攻城车：近战砸墙，百分比伤害，厚血慢速
export const IsPrayer = trait()         // 攻方祷言师：吟唱给己方随机 kind 攻速 buff

// 抛射物标签
export const IsProjectile = trait()

// 视觉效果标签（短命实体，由 updateEffects 倒计时销毁）
export const IsEffect = trait()
