import type { World, Entity } from 'koota'
import { Position, CanAttackUnits, Health, IsDefender, IsArcher, IsEnemy, Targeting } from '../traits'

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
 * 行为：静止在城墙上，攻击射程内距离自己最近的敌人
 * 锁定目标后打到底，目标死亡/离开射程后重新寻敌
 */
export function updateDefenderArcherAI(world: World, _dt: number) {
  const defenders = world.query(IsDefender, IsArcher, Position, CanAttackUnits)

  defenders.readEach(([pos, unitsAtk], defender) => {
    // 有效射程 = range + firstStrike。守弓射程与攻弓完全相同，优势全靠先手距离：
    // 敌人还在自己射程外时，守弓已经能锁定并射出第一箭
    const reach = unitsAtk.range + unitsAtk.firstStrike

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
        if (dist > reach) {
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
        if (dist <= reach && dist < nearestDist) {
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
