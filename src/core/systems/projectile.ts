import type { World, Entity } from 'koota'
import { Position, Velocity, Projectile, IsProjectile, IsWall, Targeting, Health, UnitType } from '../traits'
import { calculateDamage } from '../combat/damage'

const HIT_THRESHOLD = 0.15 // 命中判定距离（米）

/**
 * 抛射物系统
 * 追踪目标飞行 + 命中检测 + 伤害结算
 */
export function updateProjectiles(world: World, _dt: number) {
  const projectiles = world.query(IsProjectile, Position, Velocity, Projectile, Targeting('*'))

  const toDestroy: Entity[] = []

  projectiles.updateEach(([pos, vel, proj], projectile) => {
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

    // 城墙目标：直线向前飞行，z 到位即命中
    if (target.has(IsWall)) {
      const distToWall = targetPos.z - pos.z
      if (distToWall <= HIT_THRESHOLD) {
        if (targetHealth) {
          const finalDamage = calculateDamage(proj.sourceKind, target.get(UnitType)?.kind, proj.damage)
          target.set(Health, { current: Math.max(0, targetHealth.current - finalDamage) })
        }
        toDestroy.push(projectile)
        return
      }
      vel.x = 0
      vel.y = 0
      vel.z = proj.speed
      return
    }

    // 单位目标：追踪飞行
    const dx = targetPos.x - pos.x
    const dy = targetPos.y - pos.y
    const dz = targetPos.z - pos.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (dist < HIT_THRESHOLD) {
      if (targetHealth) {
        const finalDamage = calculateDamage(proj.sourceKind, target.get(UnitType)?.kind, proj.damage)
        target.set(Health, { current: Math.max(0, targetHealth.current - finalDamage) })
      }
      toDestroy.push(projectile)
      return
    }

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
