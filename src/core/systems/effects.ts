import type { World } from 'koota'
import { IsEffect, Effect } from '../traits'

/**
 * 视觉效果系统
 * 每帧递减 Effect.remaining，<=0 时销毁 entity。
 */
export function updateEffects(world: World, dt: number) {
  const effects = world.query(IsEffect, Effect)
  effects.updateEach(([effect], entity) => {
    effect.remaining -= dt
    if (effect.remaining <= 0) {
      entity.destroy()
    }
  })
}
