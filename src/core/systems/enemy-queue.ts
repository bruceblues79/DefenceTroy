import type { World, Entity } from 'koota'
import { Position, Velocity, IsEnemy, UnitType } from '../traits'
import type { UnitKind } from '../traits'

/**
 * 同列判定：x 方向中心距阈值（米）
 * 发兵点位间隔 0.5m，0.3 确保只有同列（或几乎同列）的兵才会互相排队
 */
const COLUMN_THRESHOLD = 0.3

/**
 * 排队间距：同列前后同类兵的最小 z 方向中心距（米）
 * 步兵类 z 方向长约 0.6m → 0.7m 留少量间隙
 * 攻城车 z 方向长约 1.0m → 1.2m 留少量间隙
 */
const QUEUE_GAP: Partial<Record<UnitKind, number>> = {
  archer: 0.7,
  sapper: 0.7,
  pikeman: 0.7,
  ram: 1.2,
}

/**
 * 攻城方排队间距系统
 *
 * 对每个正在前进（vel.z > 0）的攻城方单位，查找前方同类型、同 x 列、
 * 距离小于排队间距的最近同类兵，匹配其速度（vel.z）：
 * - 前方停止 → 自身停止（排队等待）
 * - 前方移动 → 自身同速随行（保持间距，不追尾）
 * - 无前方阻挡 → 按自身速度前进
 *
 * 不影响攻击守军逻辑：弓兵/长枪兵的 AI 已在射程内有守军时
 * 将 vel.z 设为 0，本系统只处理前进中的单位。
 *
 * 执行时机：所有敌人 AI 之后、updateMovement 之前。
 */
export function updateEnemyQueue(world: World, _dt: number) {
  // 收集所有攻城方单位（位置不变，速度需实时读取以支持链式传播）
  type Entry = { entity: Entity; z: number; x: number; kind: UnitKind }
  const entries: Entry[] = []

  world.query(IsEnemy, Position, Velocity, UnitType).readEach(([pos, _vel, ut], entity) => {
    entries.push({ entity, z: pos.z, x: pos.x, kind: ut.kind })
  })

  if (entries.length < 2) return

  // 按 z 降序（前方在前），保证速度匹配从前往后链式传播：
  // 前方停 → 后方读取前方已调整的速度也停，避免后方误判前方仍在移动而追尾
  entries.sort((a, b) => b.z - a.z)

  for (let i = 0; i < entries.length; i++) {
    const cur = entries[i]
    const curVel = cur.entity.get(Velocity)
    if (!curVel || curVel.z <= 0) continue

    const gap = QUEUE_GAP[cur.kind] ?? 0.7
    let nearestDist = Infinity
    let matchedVelZ: number | null = null

    // 只检查前方（索引 < i，因已按 z 降序排列）同类单位
    for (let j = 0; j < i; j++) {
      const other = entries[j]
      if (other.kind !== cur.kind) continue
      if (Math.abs(other.x - cur.x) > COLUMN_THRESHOLD) continue // 不同列
      const dist = other.z - cur.z
      if (dist >= gap) continue // 距离太远，不匹配
      if (dist < nearestDist) {
        nearestDist = dist
        const otherVel = other.entity.get(Velocity)
        matchedVelZ = otherVel?.z ?? 0
      }
    }

    if (matchedVelZ !== null) {
      cur.entity.set(Velocity, { x: curVel.x, y: curVel.y, z: matchedVelZ })
    }
  }
}
