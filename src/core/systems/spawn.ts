import type { World } from 'koota'
import { spawnActions, ENEMY_SPAWN_X, ENEMY_SPAWN_Z } from '../actions'

const SPAWN_INTERVAL = 0.5 // 每只间隔秒数
const TOTAL_COUNT = 9 // 总共刷 9 只

/**
 * 刷怪系统
 * 间隔刷出 9 只敌人，随机选出生槽位（不重复）
 */
export function createSpawnSystem() {
  let timer = 0
  let spawned = 0
  let started = false
  let slots: number[] = []

  return {
    start() {
      started = true
      timer = 0
      spawned = 0
      slots = [...ENEMY_SPAWN_X].sort(() => Math.random() - 0.5)
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
        spawnActions(world).spawnEnemyArcher(x, ENEMY_SPAWN_Z)
        spawned++
      }
    },
  }
}
