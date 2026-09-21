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
  // 处理所有带 Attack 的单位——冷却无论有无目标都应流逝
  const attackers = world.query(Attack)
  const actions = spawnActions(world)

  attackers.updateEach(([attack], attacker) => {
    // 纯状态机：仅检查 Targeting 是否存在。目标有效性由 AI 系统与 death 系统维护
    const target = attacker.targetFor(Targeting)

    if (attack.isAttacking) {
      // 攻击进行中
      attack.attackTimer += dt

      if (target) {
        // 根据目标类型选择攻击参数
        let damage: number
        let interval: number
        let attackPoint: number
        if (target.has(IsWall)) {
          const wallAtk = attacker.get(CanAttackWall)
          if (!wallAtk) {
            abortAttack(attack)
            return
          }
          damage = wallAtk.damage
          interval = wallAtk.interval
          attackPoint = wallAtk.attackPoint
        } else {
          const unitsAtk = attacker.get(CanAttackUnits)
          if (!unitsAtk) {
            abortAttack(attack)
            return
          }
          damage = unitsAtk.damage
          interval = unitsAtk.interval
          attackPoint = unitsAtk.attackPoint
        }

        // 到达攻击点 → 触发伤害结算
        if (!attack.hasFired && attack.attackTimer >= attackPoint) {
          attack.hasFired = true
          if (attacker.has(IsMelee)) {
            // 近战：直接扣血（无抛射物飞行）
            const targetHealth = target.get(Health)
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
      } else {
        // 目标丢失，中止当前攻击回到就绪态
        abortAttack(attack)
      }
    } else if (attack.cooldown > 0) {
      // 冷却中（无论有无目标都流逝）
      attack.cooldown -= dt
    } else if (target) {
      // 冷却结束且有有效目标 → 开始新一次攻击
      attack.isAttacking = true
      attack.attackTimer = 0
      attack.hasFired = false
    }
  })
}

/** 中止当前攻击，回到就绪态（cooldown=0，可立即接敌） */
function abortAttack(attack: { isAttacking: boolean; attackTimer: number; hasFired: boolean; cooldown: number }) {
  attack.isAttacking = false
  attack.attackTimer = 0
  attack.hasFired = false
  attack.cooldown = 0
}
