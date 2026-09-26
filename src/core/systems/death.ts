import type { World, Entity } from 'koota'
import { Health, Targeting, IsWall, IsDefender } from '../traits'

/**
 * 死亡事件队列（渲染层消费）
 *
 * 为什么需要它：死亡与销毁发生在同一帧的同一个 tick 里，且系统先于渲染层的 useFrame 执行，
 * 所以渲染组件永远读不到「hp <= 0」的那一刻（等它去读，实体已被 destroy）。
 * 要播 die 就只能靠这里留下的 id 信号：渲染层在组件卸载时消费，命中才播尸体动画。
 * 回收（recycleDefenderUnit）不走这里，所以回收不会留下尸体。
 */
export const deathQueue = new Set<number>()

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
    // 城墙没有角色模型，不进死亡队列
    if (!entity.has(IsWall)) deathQueue.add(entity.id())
    entity.destroy()
  }
}
