import type { World } from 'koota'
import { Attack, CanAttackUnits, CanAttackWall, Targeting, Health, IsWall, IsMelee, IsRam, UnitType, Position } from '../traits'
import { spawnActions } from '../actions'
import { getDamagePercentage } from '../combat/damage'
import { playPositionalSound } from '../audio'

/**
 * 攻击系统
 * - 目标是城墙 → 用 CanAttackWall 的 interval
 * - 目标是单位 → 用 CanAttackUnits 的 interval
 * - 伤害统一由 combat/damage.ts 的百分比表按兵种组合查表，结算为目标 maxHP × 百分比
 * 攻击开始即结算伤害（近战直接扣血，远程发射抛射物），无动画触发点。
 */
export function updateAttack(world: World, dt: number) {
  // 处理所有带 Attack 的单位——冷却无论有无目标都应流逝
  const attackers = world.query(Attack)
  const actions = spawnActions(world)

  attackers.updateEach(([attack], attacker) => {
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

      // 根据目标类型选择攻击参数（仅需 interval，伤害改查表）
      if (target.has(IsWall)) {
        if (!attacker.get(CanAttackWall)) {
          abortAttack(attack)
          return
        }
      } else {
        if (!attacker.get(CanAttackUnits)) {
          abortAttack(attack)
          return
        }
      }

      // 查表获取伤害百分比，再按目标 maxHP 换算实际伤害
      const sourceKind = attacker.get(UnitType)?.kind
      const pct = getDamagePercentage(sourceKind, target)
      const targetHealth = target.get(Health)
      const damage = targetHealth ? targetHealth.max * (pct / 100) : 0

      if (attacker.has(IsMelee) || attacker.has(IsRam)) {
        // 近战：直接扣血（无抛射物飞行）
        if (targetHealth) {
          target.set(Health, { current: Math.max(0, targetHealth.current - damage) })
          if (target.has(IsWall)) {
            const tp = target.get(Position)
            if (tp) playPositionalSound('wallHit', [tp.x, tp.y, tp.z])
          }
        }
      } else {
        // 远程：发射抛射物 + 播放发射音效（抛射物携带百分比，命中时按目标 maxHP 结算）
        const kind = attacker.get(UnitType)?.kind
        const ap = attacker.get(Position)
        if (ap) playPositionalSound(kind === 'archer' ? 'bow' : 'spear', [ap.x, ap.y, ap.z])
        actions.spawnProjectile(attacker, target, pct)
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
