import type { World } from 'koota'
import { Position, Velocity, CanAttackWall, IsEnemy, IsMelee, IsWall, Targeting } from '../traits'
import { ENEMY_SAPPER_SPEED } from '../actions'

/**
 * 敌方攻城兵 AI 系统
 * 行为：直线向城墙前进，pos.z >= CanAttackWall.wallZ 时停下攻击城墙
 * 纯城墙型单位，不攻击守军 —— 作用是逼守军把火力分到它身上（干扰/送钱）
 */
export function updateEnemySapperAI(world: World, _dt: number) {
  const sappers = world.query(IsEnemy, IsMelee, Position, CanAttackWall, Velocity)

  sappers.updateEach(([pos, wallAtk, vel], unit) => {
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
      vel.z = ENEMY_SAPPER_SPEED
    }
  })
}
