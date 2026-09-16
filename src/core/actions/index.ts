// Action 定义入口
// Action = 离散、同步的状态变更（spawn/update/destroy），可从任何调用点复用
// React 端通过 useActions 调用，避免在 effect/event 中直接操作 world

export {
  spawnActions,
  WALL_POSITION,
  WALL_WIDTH,
  WALL_HP,
  WALL_ATTACK_LINE_Z,
  ENEMY_ARCHER_HP,
  ENEMY_ARCHER_SPEED,
  ENEMY_ARCHER_RANGE,
  ENEMY_ARCHER_DAMAGE,
  ENEMY_ARCHER_INTERVAL,
  ENEMY_ARCHER_ATTACK_POINT,
  DEFENDER_ARCHER_HP,
  DEFENDER_ARCHER_RANGE,
  DEFENDER_ARCHER_DAMAGE,
  DEFENDER_ARCHER_INTERVAL,
  DEFENDER_ARCHER_ATTACK_POINT,
  PROJECTILE_SPEED,
  WALL_SLOTS,
  ENEMY_SPAWN_X,
  ENEMY_SPAWN_Z,
} from './spawn'

export { combatActions } from './combat'
