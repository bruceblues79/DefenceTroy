import type { World, Entity } from 'koota'
import { Health, Targeting } from '../traits'

/**
 * 死亡系统
 * 销毁生命值 <= 0 的实体，同时清理指向它的 Targeting 关系
 */
export function updateDeath(world: World, _dt: number) {
  const dying: Entity[] = []

  world.query(Health).readEach(([health], entity) => {
    if (health.current <= 0) {
      dying.push(entity)
    }
  })

  if (dying.length === 0) return

  // 清理所有指向死亡实体的 Targeting 关系
  const allWithTarget = world.query(Targeting('*'))
  allWithTarget.readEach((_, entity) => {
    const target = entity.targetFor(Targeting)
    if (target && dying.includes(target)) {
      entity.remove(Targeting('*'))
    }
  })

  // 销毁死亡实体
  for (const entity of dying) {
    entity.destroy()
  }
}
