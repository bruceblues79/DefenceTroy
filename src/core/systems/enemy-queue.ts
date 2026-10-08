import type { World } from 'koota'
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
  // 第一遍：收集所有攻城方单位快照（只读）
  type Snapshot = { x: number; z: number; velZ: number; kind: UnitKind }
  const snapshot: Snapshot[] = []

  world.query(IsEnemy, Position, Velocity, UnitType).readEach(([pos, vel, ut]) => {
    snapshot.push({ x: pos.x, z: pos.z, velZ: vel.z, kind: ut.kind })
  })

  if (snapshot.length < 2) return

  // 第二遍：对每个正在前进的单位，匹配 gap 内最近前方同类兵的速度
  // 前方停则停（排队），前方行则同速随行（保持间距），无前方阻挡则按自身速度前进
  world.query(IsEnemy, Position, Velocity, UnitType).updateEach(([pos, vel, ut]) => {
    if (vel.z <= 0) return

    const gap = QUEUE_GAP[ut.kind] ?? 0.7
    let matchedVelZ: number | null = null
    let nearestDist = Infinity

    for (const other of snapshot) {
      if (other.kind !== ut.kind) continue
      if (other.z <= pos.z) continue // 不在前方
      if (Math.abs(other.x - pos.x) > COLUMN_THRESHOLD) continue // 不同列
      const dist = other.z - pos.z
      if (dist >= gap) continue // 距离太远，不匹配
      if (dist < nearestDist) {
        nearestDist = dist
        matchedVelZ = other.velZ
      }
    }

    if (matchedVelZ !== null) {
      vel.z = matchedVelZ
    }
  })
}
