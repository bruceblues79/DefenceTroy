import type { World, Entity } from 'koota'
import { Position, CanAttackUnits, Health, IsDefender, IsSpearBreaker, IsEnemy, Targeting } from '../traits'

/**
 * 计算 XZ 平面距离
 */
function distanceXZ(ax: number, az: number, bx: number, bz: number) {
  const dx = ax - bx
  const dz = az - bz
  return Math.sqrt(dx * dx + dz * dz)
}

/**
 * 守军破矛兵 AI 系统
 * 行为：静止在城墙上，攻击射程内距离自己最近的敌人
 * 与守军弓兵结构一致，区别在于射程/伤害参数（由 CanAttackUnits 提供）
 * 射程 3.3 比矛骑士 2.5 略大（先手由此而来）；够不到攻弓（纵深 3.55）是它「专而不强」的代价
 */
export function updateDefenderSpearBreakerAI(world: World, _dt: number) {
  const defenders = world.query(IsDefender, IsSpearBreaker, Position, CanAttackUnits)

  defenders.readEach(([pos, unitsAtk], defender) => {
    // 1. 检查当前目标是否有效
    let target = defender.targetFor(Targeting)

    if (target) {
      const targetPos = target.get(Position)
      const targetHealth = target.get(Health)
      if (!targetPos || (targetHealth && targetHealth.current <= 0)) {
        defender.remove(Targeting('*'))
        target = undefined
      } else {
        const dist = distanceXZ(pos.x, pos.z, targetPos.x, targetPos.z)
        if (dist > unitsAtk.range) {
          defender.remove(Targeting('*'))
          target = undefined
        }
      }
    }

    // 2. 无目标时，搜索射程内距离自己最近的敌人
    if (!target) {
      let nearestEnemy: Entity | null = null
      let nearestDist = Infinity

      world.query(IsEnemy, Position).readEach(([enemyPos], enemy) => {
        const dist = distanceXZ(pos.x, pos.z, enemyPos.x, enemyPos.z)
        if (dist <= unitsAtk.range && dist < nearestDist) {
          nearestDist = dist
          nearestEnemy = enemy
        }
      })

      if (nearestEnemy) {
        defender.add(Targeting(nearestEnemy))
      }
    }
  })
}
