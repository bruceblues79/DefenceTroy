import type { World } from 'koota'
import { spawnActions, ENEMY_SPAWN_X, ENEMY_SPAWN_Z } from '../actions'

const SPAWN_INTERVAL = 3 // 秒
const SPAWN_COUNT = 9 // 每次刷怪数量
const MAX_WAVES = 1 // 总波数

/**
 * 刷怪系统
 * 每隔固定时间在随机出生点生成敌人弓手
 * 达到 MAX_WAVES 波后停止刷怪
 */
export function createSpawnSystem() {
  let timer = 0
  let started = false
  let wavesSpawned = 0

  return {
    start() {
      started = true
      timer = 0
      wavesSpawned = 0
    },
    stop() {
      started = false
    },
    update(world: World, dt: number) {
      if (!started) return
      if (wavesSpawned >= MAX_WAVES) return

      timer += dt
      if (timer >= SPAWN_INTERVAL) {
        timer = 0
        wavesSpawned++
        const actions = spawnActions(world)

        // 随机选 SPAWN_COUNT 个不重复的点位
        const shuffled = [...ENEMY_SPAWN_X].sort(() => Math.random() - 0.5)
        const selected = shuffled.slice(0, SPAWN_COUNT)

        for (const x of selected) {
          actions.spawnEnemyArcher(x, ENEMY_SPAWN_Z)
        }
      }
    },
  }
}
