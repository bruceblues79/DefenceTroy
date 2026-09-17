import type { World, Entity } from 'koota'
import { Health, Targeting, IsWall, IsDefender } from '../traits'

/**
 * 死亡系统
 * 销毁生命值 <= 0 的实体，同时清理指向它的 Targeting 关系
 * 城墙被毁时：所有守军立即死亡（城墙破则守军随城墙消失）
 */
export function updateDeath(world: World, _dt: number) {
  const dying: Entity[] = []
  let wallDestroyed = false

  world.query(Health).readEach(([health], entity) => {
    if (health.current <= 0) {
      dying.push(entity)
      if (entity.has(IsWall)) wallDestroyed = true
    }
  })

  // 城墙被毁 → 守军全灭
  if (wallDestroyed) {
    world.query(IsDefender, Health).updateEach(([health]) => {
      health.current = 0
    })
    // 重新收集所有 dying（含刚被置 0 的守军）
    world.query(Health).readEach(([health], entity) => {
      if (health.current <= 0 && !dying.includes(entity)) {
        dying.push(entity)
      }
    })
  }

  if (dying.length === 0) return

  // 清理所有指向死亡实体的 Targeting 关系
  for (const deadEntity of dying) {
    const attackers = world.query(Targeting(deadEntity))
    attackers.readEach((_, attacker) => {
      attacker.remove(Targeting('*'))
    })
  }

  for (const entity of dying) {
    entity.destroy()
  }
}
