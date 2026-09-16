import type { World, Entity } from 'koota'
import {
  Position,
  Velocity,
  Attack,
  Health,
  IsEnemy,
  IsArcher,
  IsDefender,
  IsWall,
  Targeting,
} from '../traits'
import { ENEMY_ARCHER_SPEED, WALL_POSITION } from '../actions'

/**
 * 计算 XZ 平面距离
 */
function distanceXZ(ax: number, az: number, bx: number, bz: number) {
  const dx = ax - bx
  const dz = az - bz
  return Math.sqrt(dx * dx + dz * dz)
}

/**
 * 敌人弓兵 AI 系统
 * 行为：直线向城墙前进，进入射程后停下攻击
 * 索敌优先级：守军弓兵 > 城墙
 */
export function updateEnemyArcherAI(world: World, _dt: number) {
  const enemies = world.query(IsEnemy, IsArcher, Position, Attack, Velocity)

  enemies.updateEach(([pos, attack, vel], enemy) => {
    // 1. 检查当前目标是否有效
    let target = enemy.targetFor(Targeting)

    if (target) {
      const targetPos = target.get(Position)
      const targetHealth = target.get(Health)
      // 目标已死亡或无位置 → 清除目标
      if (!targetPos || (targetHealth && targetHealth.current <= 0)) {
        enemy.remove(Targeting('*'))
        target = undefined
      } else {
        const dist = distanceXZ(pos.x, pos.z, targetPos.x, targetPos.z)
        // 目标在射程外 → 清除，重新索敌
        if (dist > attack.range) {
          enemy.remove(Targeting('*'))
          target = undefined
        }
      }
    }

    // 2. 搜索守军弓兵目标
    if (!target) {
      let nearestDefender: Entity | null = null
      let nearestDist = Infinity

      world.query(IsDefender, IsArcher, Position).readEach(([defPos], defender) => {
        const dist = distanceXZ(pos.x, pos.z, defPos.x, defPos.z)
        if (dist <= attack.range && dist < nearestDist) {
          nearestDist = dist
          nearestDefender = defender
        }
      })

      if (nearestDefender) {
        enemy.add(Targeting(nearestDefender))
        target = nearestDefender
      }
    }

    // 3. 没找到守军，检查城墙是否在攻击范围内
    if (!target) {
      const distToWall = WALL_POSITION.z - pos.z
      if (distToWall <= attack.range) {
        const wall = world.queryFirst(IsWall, Position)
        if (wall) {
          enemy.add(Targeting(wall))
          target = wall
        }
      }
    }

    // 4. 有目标 → 停止移动；没目标 → 向城墙前进
    if (target) {
      vel.x = 0
      vel.z = 0
    } else {
      // 直线向城墙方向（+z）前进
      vel.x = 0
      vel.z = ENEMY_ARCHER_SPEED
    }
  })
}
