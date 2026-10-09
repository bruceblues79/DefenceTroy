import type { World } from 'koota'
import { AttackSpeedBuff } from '../traits'

/**
 * 攻速 buff 倒计时系统
 * 每帧递减 AttackSpeedBuff.remaining，<=0 时移除 trait。
 * 不依赖 prayer 存活：prayer 死后已挂的 buff 继续按 remaining 倒计时。
 */
export function updateAttackSpeedBuff(world: World, dt: number) {
  const buffs = world.query(AttackSpeedBuff)
  buffs.updateEach(([buff], entity) => {
    buff.remaining -= dt
    if (buff.remaining <= 0) {
      entity.remove(AttackSpeedBuff)
    }
  })
}
