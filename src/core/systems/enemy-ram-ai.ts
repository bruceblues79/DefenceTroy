import type { World } from 'koota'
import { Position, Velocity, CanAttackWall, IsEnemy, IsRam, IsWall, Targeting } from '../traits'
import { ENEMY_RAM_SPEED } from '../actions'

/**
 * 敌方攻城车 AI 系统
 * 行为：直线向城墙前进，pos.z >= CanAttackWall.wallZ 时停下攻击城墙
 * 纯城墙型单位，不攻击守军 —— 逼守军把火力分到它身上（需集火）
 */
export function updateEnemyRamAI(world: World, _dt: number) {
  const rams = world.query(IsEnemy, IsRam, Position, CanAttackWall, Velocity)

  rams.updateEach(([pos, wallAtk, vel], unit) => {
    // 抵达攻城 z 位置 → 停下并锁定城墙
    if (pos.z >= wallAtk.wallZ) {
      vel.x = 0
      vel.z = 0

      const currentTarget = unit.targetFor(Targeting)
      if (!currentTarget) {
        const wall = world.queryFirst(IsWall, Position)
        if (wall) unit.add(Targeting(wall))
      }
    } else {
      // 直线向城墙方向（+z）前进
      vel.x = 0
      vel.z = ENEMY_RAM_SPEED
    }
  })
}
