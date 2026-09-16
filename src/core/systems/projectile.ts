import type { World, Entity } from 'koota'
import { Position, Velocity, Projectile, IsProjectile, Targeting, Health } from '../traits'

const HIT_THRESHOLD = 0.15 // 命中判定距离（米）

/**
 * 抛射物系统
 * 追踪目标飞行 + 命中检测 + 伤害结算
 */
export function updateProjectiles(world: World, _dt: number) {
  const projectiles = world.query(IsProjectile, Position, Velocity, Projectile, Targeting('*'))

  const toDestroy: Entity[] = []

  projectiles.readEach(([pos, vel, proj], projectile) => {
    const target = projectile.targetFor(Targeting)

    // 目标不存在 → 销毁
    if (!target) {
      toDestroy.push(projectile)
      return
    }

    const targetPos = target.get(Position)
    const targetHealth = target.get(Health)

    // 目标无位置或已死亡 → 销毁
    if (!targetPos || (targetHealth && targetHealth.current <= 0)) {
      toDestroy.push(projectile)
      return
    }

    // 计算朝向目标的方向
    const dx = targetPos.x - pos.x
    const dy = targetPos.y - pos.y
    const dz = targetPos.z - pos.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (dist < HIT_THRESHOLD) {
      // 命中！造成伤害并销毁抛射物
      if (targetHealth) {
        target.set(Health, { current: Math.max(0, targetHealth.current - proj.damage) })
      }
      toDestroy.push(projectile)
      return
    }

    // 设置速度朝向目标
    const speed = proj.speed
    vel.x = (dx / dist) * speed
    vel.y = (dy / dist) * speed
    vel.z = (dz / dist) * speed
  })

  // 批量销毁
  for (const p of toDestroy) {
    p.destroy()
  }
}
