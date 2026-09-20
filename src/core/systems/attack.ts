import type { World } from 'koota'
import { Attack, CanAttackUnits, CanAttackWall, Targeting, Health, IsWall, IsMelee } from '../traits'
import { spawnActions } from '../actions'

/**
 * 攻击系统
 * 根据当前目标类型选择能力参数：
 * - 目标是城墙 → 用 CanAttackWall 的 damage/interval/attackPoint
 * - 目标是单位 → 用 CanAttackUnits 的 damage/interval/attackPoint
 * 到 attackPoint：IsMelee 直接扣血，否则发射抛射物
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

    // 根据目标类型选择攻击参数
    let damage: number
    let interval: number
    let attackPoint: number
    if (target.has(IsWall)) {
      const wallAtk = attacker.get(CanAttackWall)
      if (!wallAtk) return
      damage = wallAtk.damage
      interval = wallAtk.interval
      attackPoint = wallAtk.attackPoint
    } else {
      const unitsAtk = attacker.get(CanAttackUnits)
      if (!unitsAtk) return
      damage = unitsAtk.damage
      interval = unitsAtk.interval
      attackPoint = unitsAtk.attackPoint
    }

    if (attack.isAttacking) {
      // 攻击进行中
      attack.attackTimer += dt

      // 到达攻击点 → 触发伤害结算
      if (!attack.hasFired && attack.attackTimer >= attackPoint) {
        attack.hasFired = true
        if (attacker.has(IsMelee)) {
          // 近战：直接扣血（无抛射物飞行）
          if (targetHealth) {
            target.set(Health, { current: Math.max(0, targetHealth.current - damage) })
          }
        } else {
          // 远程：发射抛射物
          actions.spawnProjectile(attacker, target, damage)
        }
      }

      // 攻击周期结束，立即进入下一次攻击（interval 已含完整周期时长）
      if (attack.attackTimer >= interval) {
        attack.isAttacking = false
        attack.attackTimer = 0
        attack.hasFired = false
        attack.cooldown = 0
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
