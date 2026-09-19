import type { World, Entity } from 'koota'
import {
  Position,
  Velocity,
  CanAttackUnits,
  CanAttackWall,
  Health,
  IsEnemy,
  IsSpearman,
  IsDefender,
  IsWall,
  Targeting,
} from '../traits'
import { ENEMY_SPEARMAN_SPEED } from '../actions'

/**
 * 计算 XZ 平面距离
 */
function distanceXZ(ax: number, az: number, bx: number, bz: number) {
  const dx = ax - bx
  const dz = az - bz
  return Math.sqrt(dx * dx + dz * dz)
}

/**
 * 敌方矛兵 AI 系统
 * 行为：优先攻击射程内守军；无守军时前进到 CanAttackWall.wallZ 攻击城墙
 * 与敌弓兵结构一致，区别在于射程/伤害参数（由 CanAttackUnits/CanAttackWall 提供）
 */
export function updateEnemySpearmanAI(world: World, _dt: number) {
  const enemies = world.query(IsEnemy, IsSpearman, Position, CanAttackUnits, CanAttackWall, Velocity)

  enemies.updateEach(([pos, unitsAtk, wallAtk, vel], enemy) => {
    // 1. 检查当前目标是否有效
    let target = enemy.targetFor(Targeting)

    if (target) {
      const targetPos = target.get(Position)
      const targetHealth = target.get(Health)
      if (!targetPos || (targetHealth && targetHealth.current <= 0)) {
        enemy.remove(Targeting('*'))
        target = undefined
      } else if (target.has(IsWall)) {
        if (pos.z < wallAtk.wallZ) {
          enemy.remove(Targeting('*'))
          target = undefined
        }
      } else {
        const dist = distanceXZ(pos.x, pos.z, targetPos.x, targetPos.z)
        if (dist > unitsAtk.range) {
          enemy.remove(Targeting('*'))
          target = undefined
        }
      }
    }

    // 2. 优先搜索射程内守军单位（即使当前锁定城墙，也要切换至守军）
    if (!target || target.has(IsWall)) {
      let nearestDefender: Entity | null = null
      let nearestDist = Infinity

      world.query(IsDefender, Position).readEach(([defPos], defender) => {
        const dist = distanceXZ(pos.x, pos.z, defPos.x, defPos.z)
        if (dist <= unitsAtk.range && dist < nearestDist) {
          nearestDist = dist
          nearestDefender = defender
        }
      })

      if (nearestDefender) {
        enemy.remove(Targeting('*'))
        enemy.add(Targeting(nearestDefender))
        target = nearestDefender
      }
    }

    // 3. 无守军目标时，检查是否抵达攻城 z 位置
    if (!target) {
      if (pos.z >= wallAtk.wallZ) {
        const wall = world.queryFirst(IsWall, Position)
        if (wall) {
          enemy.add(Targeting(wall))
          target = wall
        }
      }
    }

    // 4. 有目标 → 停止；无目标 → 向城墙前进
    if (target) {
      vel.x = 0
      vel.z = 0
    } else {
      vel.x = 0
      vel.z = ENEMY_SPEARMAN_SPEED
    }
  })
}
