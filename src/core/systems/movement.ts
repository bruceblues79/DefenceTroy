import type { World } from 'koota'
import { Position, Velocity, Attack } from '../traits'

/**
 * 移动系统：将速度叠加到位置
 * 处理所有带 Position + Velocity 的实体
 *
 * 攻击中（attack.isAttacking=true）冻结移动：让 atk 动画完整播放，避免动作还没播完
 * 弓箭手就因 target 中途死亡被 AI 设 vel 而开始滑动
 */
export function updateMovement(world: World, dt: number) {
  world.query(Position, Velocity).updateEach(([pos, vel], entity) => {
    const attack = entity.get(Attack)
    if (attack?.isAttacking) return
    pos.x += vel.x * dt
    pos.y += vel.y * dt
    pos.z += vel.z * dt
  })
}
