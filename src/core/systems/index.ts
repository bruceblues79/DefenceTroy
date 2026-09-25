// System 定义入口
// System = 纯 TS 函数（world, dt），单一职责、可独立开关
// 在 View 层通过 useFrame 按顺序调用

export { updateMovement } from './movement'
export { updateEnemyArcherAI } from './enemy-archer-ai'
export { updateEnemySapperAI } from './enemy-sapper-ai'
export { updateEnemyCavalryAI } from './enemy-cavalry-ai'
export { updateDefenderArcherAI } from './defender-archer-ai'
export { updateDefenderSpearBreakerAI } from './defender-spear-breaker-ai'
export { updateCatapultBombard } from './catapult-bombard'
export { updateAttack } from './attack'
export { updateProjectiles } from './projectile'
export { updateBoulders } from './boulder'
export { updateEffects } from './effects'
export { updateDeath } from './death'
