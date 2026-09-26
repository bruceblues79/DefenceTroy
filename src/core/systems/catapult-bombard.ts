import type { World } from 'koota'
import { Attack, CanBombard, IsCatapult } from '../traits'
import { spawnActions } from '../actions'

/**
 * 投石车轰炸系统
 * 自动周期攻击，无需目标。攻击开始即 spawn 石块抛射物。
 * 与 attack.ts 独立（不依赖 Targeting）。
 */
export function updateCatapultBombard(world: World, dt: number) {
  const catapults = world.query(IsCatapult, Attack, CanBombard)
  const actions = spawnActions(world)

  catapults.updateEach(([attack, bombard], catapult) => {
    if (attack.isAttacking) {
      // 攻击周期中，等待 interval 走完后回到就绪态
      attack.attackTimer += dt
      if (attack.attackTimer >= bombard.interval) {
        attack.isAttacking = false
        attack.attackTimer = 0
        attack.cooldown = 0
      }
    } else if (attack.cooldown > 0) {
      attack.cooldown -= dt
    } else {
      // 冷却结束 → 开始新一次攻击，立即发射石块
      attack.isAttacking = true
      attack.attackTimer = 0
      actions.spawnBoulder(catapult, bombard.targetZ, bombard.radius, bombard.damage)
    }
  })
}
