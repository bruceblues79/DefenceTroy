import type { World } from 'koota'
import { Attack, CanAttackUnits, CanAttackWall, CanBombard, Targeting, Health, IsWall, IsMelee, UnitType } from '../traits'
import { spawnActions } from '../actions'
import { calculateDamage } from '../combat/damage'

/**
 * 攻击系统
 * - 目标是城墙 → 用 CanAttackWall 的 damage/interval
 * - 目标是单位 → 用 CanAttackUnits 的 damage/interval
 * 攻击开始即结算伤害（近战直接扣血，远程发射抛射物），无动画触发点。
 */
export function updateAttack(world: World, dt: number) {
  // 处理所有带 Attack 的单位——冷却无论有无目标都应流逝
  const attackers = world.query(Attack)
  const actions = spawnActions(world)

  attackers.updateEach(([attack], attacker) => {
    // 投石车由 catapult-bombard 系统独立管理，不走本系统的 Targeting 状态机
    if (attacker.has(CanBombard)) return

    // 纯状态机：仅检查 Targeting 是否存在。目标有效性由 AI 系统与 death 系统维护
    const target = attacker.targetFor(Targeting)

    if (attack.isAttacking) {
      // 攻击周期中，等待 interval 走完后回到就绪态
      attack.attackTimer += dt
      const interval = getInterval(attacker, target)
      if (attack.attackTimer >= interval) {
        attack.isAttacking = false
        attack.attackTimer = 0
        attack.cooldown = 0
      }
    } else if (attack.cooldown > 0) {
      // 冷却中（无论有无目标都流逝）
      attack.cooldown -= dt
    } else if (target) {
      // 冷却结束且有有效目标 → 开始新一次攻击，立即结算伤害
      attack.isAttacking = true
      attack.attackTimer = 0

      // 根据目标类型选择攻击参数
      let damage: number
      if (target.has(IsWall)) {
        const wallAtk = attacker.get(CanAttackWall)
        if (!wallAtk) {
          abortAttack(attack)
          return
        }
        damage = wallAtk.damage
      } else {
        const unitsAtk = attacker.get(CanAttackUnits)
        if (!unitsAtk) {
          abortAttack(attack)
          return
        }
        damage = unitsAtk.damage
      }

      if (attacker.has(IsMelee)) {
        // 近战：直接扣血（无抛射物飞行）
        const targetHealth = target.get(Health)
        if (targetHealth) {
          const finalDamage = calculateDamage(
            attacker.get(UnitType)?.kind,
            target,
            damage,
          )
          target.set(Health, { current: Math.max(0, targetHealth.current - finalDamage) })
        }
      } else {
        // 远程：发射抛射物
        actions.spawnProjectile(attacker, target, damage)
      }
    }
  })
}

/** 读取当前目标对应的攻击周期（无目标时返回 0，立即结束周期） */
function getInterval(attacker: any, target: any): number {
  if (!target) return 0
  if (target.has(IsWall)) return attacker.get(CanAttackWall)?.interval ?? 0
  return attacker.get(CanAttackUnits)?.interval ?? 0
}

/** 中止当前攻击，回到就绪态（cooldown=0，可立即接敌） */
function abortAttack(attack: { isAttacking: boolean; attackTimer: number; cooldown: number }) {
  attack.isAttacking = false
  attack.attackTimer = 0
  attack.cooldown = 0
}
