import type { World, Entity } from 'koota'
import { Position, Attack, Health, IsDefender, IsArcher, IsEnemy, Targeting } from '../traits'

/**
 * 计算 XZ 平面距离
 */
function distanceXZ(ax: number, az: number, bx: number, bz: number) {
  const dx = ax - bx
  const dz = az - bz
  return Math.sqrt(dx * dx + dz * dz)
}

/**
 * 守军弓兵 AI 系统
 * 行为：静止在城墙上，自动攻击射程内距城墙最近的敌人
 */
export function updateDefenderArcherAI(world: World, _dt: number) {
  const defenders = world.query(IsDefender, IsArcher, Position, Attack)

  defenders.readEach(([pos, attack], defender) => {
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
        if (dist > attack.range) {
          defender.remove(Targeting('*'))
          target = undefined
        }
      }
    }

    // 2. 搜索射程内距城墙最近（z 最大）的敌人
    if (!target) {
      let nearestEnemy: Entity | null = null
      let nearestZ = -Infinity // 距城墙最近 = z 值最大

      world.query(IsEnemy, IsArcher, Position).readEach(([enemyPos], enemy) => {
        const dist = distanceXZ(pos.x, pos.z, enemyPos.x, enemyPos.z)
        if (dist <= attack.range && enemyPos.z > nearestZ) {
          nearestZ = enemyPos.z
          nearestEnemy = enemy
        }
      })

      if (nearestEnemy) {
        defender.add(Targeting(nearestEnemy))
      }
    }
  })
}
