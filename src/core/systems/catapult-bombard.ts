import type { World } from 'koota'
import { Attack, CanBombard, IsCatapult } from '../traits'
import { spawnActions } from '../actions'

/**
 * 投石车轰炸系统
 * 自动周期攻击，无需目标。到 attackPoint 时 spawn 石块抛射物。
 * 与 attack.ts 独立（不依赖 Targeting）。
 */
export function updateCatapultBombard(world: World, dt: number) {
  const catapults = world.query(IsCatapult, Attack, CanBombard)
  const actions = spawnActions(world)

  catapults.updateEach(([attack, bombard], catapult) => {
    if (attack.isAttacking) {
      attack.attackTimer += dt

      // 到达攻击点 → 发射石块
      if (!attack.hasFired && attack.attackTimer >= bombard.attackPoint) {
        attack.hasFired = true
        actions.spawnBoulder(catapult, bombard.targetZ, bombard.radius, bombard.damage)
      }

      // 攻击周期结束（interval 已含完整周期时长，无需额外冷却）
      if (attack.attackTimer >= bombard.interval) {
        attack.isAttacking = false
        attack.attackTimer = 0
        attack.hasFired = false
        attack.cooldown = 0
      }
    } else if (attack.cooldown > 0) {
      attack.cooldown -= dt
    } else {
      // 冷却结束，开始新一次攻击
      attack.isAttacking = true
      attack.attackTimer = 0
      attack.hasFired = false
    }
  })
}
