import type { World } from 'koota'
import { spawnActions, ENEMY_SPAWN_X, ENEMY_SPAWN_Z } from '../actions'

const SPAWN_INTERVAL = 0.5 // 每只间隔秒数
const TOTAL_COUNT = 3 // 总共刷 3 只

/**
 * 敌方步兵刷怪系统
 * 间隔刷出 3 只敌方步兵，从 ENEMY_SPAWN_X 9 槽位随机选 3 个不重复
 */
export function createInfantrySpawnSystem() {
  let timer = 0
  let spawned = 0
  let started = false
  let slots: number[] = []

  return {
    start() {
      started = true
      timer = 0
      spawned = 0
      slots = [...ENEMY_SPAWN_X].sort(() => Math.random() - 0.5).slice(0, TOTAL_COUNT)
    },
    stop() {
      started = false
    },
    update(world: World, dt: number) {
      if (!started || spawned >= TOTAL_COUNT) return

      timer += dt
      if (timer >= SPAWN_INTERVAL) {
        timer = 0
        const x = slots[spawned]
        spawnActions(world).spawnEnemyInfantry(x, ENEMY_SPAWN_Z)
        spawned++
      }
    },
    isDone() {
      return spawned >= TOTAL_COUNT
    },
  }
}
