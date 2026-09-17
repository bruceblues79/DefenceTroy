import type { World, Entity } from 'koota'
import { Position, Velocity, Projectile, IsBoulder, IsEnemy, Health, IsEffect, Effect } from '../traits'

/**
 * 石块系统
 * 石块直线向前方（-z）飞行，到达 targetZ 时做 AOE 伤害并销毁。
 * 命中时 spawn 一个 Effect 圆片视觉（0.5s 淡出）。
 */
export function updateBoulders(world: World, _dt: number) {
  const boulders = world.query(IsBoulder, Position, Velocity, Projectile)
  const toDestroy: Entity[] = []

  boulders.updateEach(([pos, vel, proj], boulder) => {
    // 直线向 -z 飞行
    vel.x = 0
    vel.z = -proj.speed

    // 到达落地 z → AOE 伤害
    if (pos.z <= proj.targetZ) {
      world.query(IsEnemy, Position, Health).readEach(([enemyPos], enemy) => {
        const dx = enemyPos.x - pos.x
        const dz = enemyPos.z - pos.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist <= proj.aoeRadius) {
          const hp = enemy.get(Health)
          if (hp) {
            enemy.set(Health, { current: Math.max(0, hp.current - proj.damage) })
          }
        }
      })
      // 生成 AOE 命中圆片视觉（贴地 y=0.05，半径=AOE 半径，0.5s 淡出）
      world.spawn(
        Position({ x: pos.x, y: 0.05, z: pos.z }),
        IsEffect,
        Effect({ remaining: 0.5, initial: 0.5, radius: proj.aoeRadius })
      )
      toDestroy.push(boulder)
    }
  })

  for (const b of toDestroy) b.destroy()
}
