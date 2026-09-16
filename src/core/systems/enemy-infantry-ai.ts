import type { World } from 'koota'
import { Position, Velocity, Attack, IsEnemy, IsMelee, IsWall, Targeting } from '../traits'
import { ENEMY_INFANTRY_SPEED, ENEMY_INFANTRY_STOP_OFFSET, WALL_POSITION } from '../actions'

/**
 * 敌方步兵 AI 系统
 * 行为：直线向城墙前进，抵达城墙前 0.2m（z=WALL_POSITION.z-STOP_OFFSET）停下并攻击城墙
 * 纯城墙型单位，不做单位索敌
 */
export function updateEnemyInfantryAI(world: World, _dt: number) {
  const infantry = world.query(IsEnemy, IsMelee, Position, Attack, Velocity)

  infantry.updateEach(([pos, , vel], unit) => {
    const distToWall = WALL_POSITION.z - pos.z

    // 抵达停止线（城墙前 STOP_OFFSET）→ 停下并锁定城墙
    if (distToWall <= ENEMY_INFANTRY_STOP_OFFSET) {
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
