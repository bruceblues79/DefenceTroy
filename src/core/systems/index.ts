// System 定义入口
// System = 纯 TS 函数（world, dt），单一职责、可独立开关
// 在 View 层通过 useFrame 按顺序调用

export { updateMovement } from './movement'
export { updateEnemyArcherAI } from './enemy-archer-ai'
export { updateEnemyInfantryAI } from './enemy-infantry-ai'
export { updateDefenderArcherAI } from './defender-archer-ai'
export { updateAttack } from './attack'
export { updateProjectiles } from './projectile'
export { updateDeath } from './death'
export { createSpawnSystem } from './spawn'
export { createInfantrySpawnSystem } from './infantry-spawn'
