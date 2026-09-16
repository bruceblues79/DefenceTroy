import type { World } from 'koota'
import { Attack, Targeting, Health } from '../traits'
import { spawnActions } from '../actions'

/**
 * 攻击系统
 * 管理攻击冷却、攻击动画计时，在攻击点触发抛射物发射
 */
export function updateAttack(world: World, dt: number) {
  const attackers = world.query(Attack, Targeting('*'))
  const actions = spawnActions(world)

  attackers.updateEach(([attack], attacker) => {
    // 确认目标仍然存在且存活
    const target = attacker.targetFor(Targeting)
    if (!target) return
    const targetHealth = target.get(Health)
    if (targetHealth && targetHealth.current <= 0) return

    if (attack.isAttacking) {
      // 攻击进行中
      attack.attackTimer += dt

      // 到达攻击点 → 发射抛射物
      if (!attack.hasFired && attack.attackTimer >= attack.attackPoint) {
        attack.hasFired = true
        actions.spawnProjectile(attacker, target, attack.damage)
      }

      // 攻击周期结束
      if (attack.attackTimer >= attack.interval) {
        attack.isAttacking = false
        attack.attackTimer = 0
        attack.hasFired = false
        attack.cooldown = attack.interval
      }
    } else if (attack.cooldown > 0) {
      // 冷却中
      attack.cooldown -= dt
    } else {
      // 冷却结束，开始新一次攻击
      attack.isAttacking = true
      attack.attackTimer = 0
      attack.hasFired = false
    }
  })
}
