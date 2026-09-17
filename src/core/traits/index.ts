// Trait 定义入口
// 按 PRD 领域分组：combat / unit / enemy / wave / economy
// 命名规范遵循 koota SKILL：Tags 用 Is 前缀，Relations 用介词，Trait 用名词

export { Position } from './position'
export { Velocity } from './velocity'
export { Health } from './health'
export { Attack, CanAttackUnits, CanAttackWall, CanBombard } from './attack'
export { Projectile } from './projectile'
export { IsEnemy, IsDefender, IsWall, IsArcher, IsMelee, IsSpearman, IsCatapult, IsProjectile, IsBoulder } from './tags'
export { Targeting } from './relations'
