import type { World } from 'koota'
import { Attack, Targeting, Health, IsMelee } from '../traits'
import { spawnActions } from '../actions'

/**
 * 攻击系统
 * 管理攻击冷却、攻击动画计时，在攻击点触发伤害结算
 * - 近战单位（IsMelee）：到攻击点直接扣目标血
 * - 远程单位：到攻击点发射抛射物
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

      // 到达攻击点 → 触发伤害结算
      if (!attack.hasFired && attack.attackTimer >= attack.attackPoint) {
        attack.hasFired = true
        if (attacker.has(IsMelee)) {
          // 近战：直接扣血（无抛射物飞行）
          if (targetHealth) {
            target.set(Health, { current: Math.max(0, targetHealth.current - attack.damage) })
          }
        } else {
          // 远程：发射抛射物
          actions.spawnProjectile(attacker, target, attack.damage)
        }
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
