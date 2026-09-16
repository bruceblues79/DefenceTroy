import type { World } from 'koota'
import { spawnActions, ENEMY_SPAWN_X, ENEMY_SPAWN_Z } from '../actions'

const SPAWN_COUNT = 9 // 每次刷怪数量

/**
 * 刷怪系统
 * 只刷一波 9 只，立即刷出
 */
export function createSpawnSystem() {
  let spawned = false

  return {
    start() {},
    stop() {},
    update(world: World, _dt: number) {
      if (spawned) return
      spawned = true

      const actions = spawnActions(world)
      // 在全部 9 个点位各刷一只
      for (const x of ENEMY_SPAWN_X) {
        actions.spawnEnemyArcher(x, ENEMY_SPAWN_Z)
      }
    },
  }
}
