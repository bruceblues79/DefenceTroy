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
  prayer: 0.7,
}

/**
 * 攻城方排队防穿越系统
 *
 * 对每个正在前进（vel.z > 0）的攻城方单位，检查前方是否有
 * 同类型、同 x 列、已停止（vel.z <= 0）的同类兵且距离小于排队间距；
 * 若被阻挡则将 vel.z 置 0，使其排在前方同类兵身后等待。
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

  // 第二遍：对每个正在前进的单位，检查是否被前方同类兵阻挡
  world.query(IsEnemy, Position, Velocity, UnitType).updateEach(([pos, vel, ut]) => {
    if (vel.z <= 0) return

    const gap = QUEUE_GAP[ut.kind] ?? 0.7
    let blocked = false

    for (const other of snapshot) {
      if (other.kind !== ut.kind) continue
      if (other.z <= pos.z) continue // 不在前方
      if (Math.abs(other.x - pos.x) > COLUMN_THRESHOLD) continue // 不同列
      if (other.z - pos.z > gap) continue // 距离太远
      if (other.velZ > 0) continue // 前方兵仍在移动，不阻挡
      blocked = true
      break
    }

    if (blocked) {
      vel.z = 0
    }
  })
}
