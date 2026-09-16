import type { World } from 'koota'
import { Position, Velocity, Attack, IsEnemy, IsMelee, IsWall, Targeting } from '../traits'
import { ENEMY_INFANTRY_SPEED, WALL_POSITION } from '../actions'

/**
 * 敌方步兵 AI 系统
 * 行为：直线向城墙前进，距城墙 z ≤ attack.range 时停下并攻击城墙
 * 与敌方弓兵 AI 的城墙判定对称（用 attack.range 做停止+攻击线）
 */
export function updateEnemyInfantryAI(world: World, _dt: number) {
  const infantry = world.query(IsEnemy, IsMelee, Position, Attack, Velocity)

  infantry.updateEach(([pos, attack, vel], unit) => {
    const distToWall = WALL_POSITION.z - pos.z

    // 进入攻击范围 → 停下并锁定城墙
    if (distToWall <= attack.range) {
      vel.x = 0
      vel.z = 0

      // 锁定城墙（若无目标）
      const currentTarget = unit.targetFor(Targeting)
      if (!currentTarget) {
        const wall = world.queryFirst(IsWall, Position)
        if (wall) unit.add(Targeting(wall))
      }
    } else {
      // 直线向城墙方向（+z）前进
      vel.x = 0
      vel.z = ENEMY_INFANTRY_SPEED
    }
  })
}
