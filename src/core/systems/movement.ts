import type { World } from 'koota'
import { Position, Velocity } from '../traits'

/**
 * 移动系统：将速度叠加到位置
 * 处理所有带 Position + Velocity 的实体
 */
export function updateMovement(world: World, dt: number) {
  world.query(Position, Velocity).updateEach(([pos, vel]) => {
    pos.x += vel.x * dt
    pos.y += vel.y * dt
    pos.z += vel.z * dt
  })
}
