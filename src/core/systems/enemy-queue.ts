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
  prayer: 0.7,
}

/**
 * 攻城方排队防穿越系统
 *
 * 从前到后（z 降序）逐个处理：对每个正在前进的单位，找前方
 * 同类型、同 x 列、已停止的同类兵中**最近**的那个；
 * 若「本帧移动后」距离小于 gap，则阻挡（vel.z=0）；
 * 若已冲入 gap 内，一次性 snap 到 nearestFront.z - gap。
 *
 * 关键不变量：
 * - 回退后同步更新 entry.z，后续单位据此排队，保证队列单调（每两个相邻 stopped 单位间距 ≥ gap）。
 * - 只取最近的前方 stopped 同类作为 blocker，避免被远处同类误推到过前位置。
 *
 * 执行时机：所有敌人 AI 之后、updateMovement 之前。
 */
export function updateEnemyQueue(world: World, dt: number) {
  type Entry = { x: number; z: number; velZ: number; kind: UnitKind; stopped: boolean; entity: Entity }
  const entries: Entry[] = []

  world.query(IsEnemy, Position, Velocity, UnitType).readEach(([pos, vel, ut], entity) => {
    entries.push({
      x: pos.x,
      z: pos.z,
      velZ: vel.z,
      kind: ut.kind,
      stopped: vel.z <= 0,
      entity,
    })
  })

  if (entries.length < 2) return

  // 从前到后排序（z 降序）：前方单位先处理，停止状态向后传播
  entries.sort((a, b) => b.z - a.z)

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]
    if (e.stopped) continue

    const gap = QUEUE_GAP[e.kind] ?? 0.7
    let nearestFrontZ = Infinity // 离 e 最近的前方 stopped 同类的 z（越小越近）
    let blocked = false

    // entries[0..i-1] 是前方的单位（z 降序排列）
    for (let j = 0; j < i; j++) {
      const front = entries[j]
      if (front.kind !== e.kind) continue
      if (Math.abs(front.x - e.x) > COLUMN_THRESHOLD) continue
      if (!front.stopped) continue
      // 基于「本帧移动后」的距离判定：防止放行后 movement 又把它推进 gap 内
      const projected = front.z - (e.z + e.velZ * dt)
      if (projected > gap) continue
      // 取最近的前方 stopped 同类（z 最小）
      if (front.z < nearestFrontZ) nearestFrontZ = front.z
      blocked = true
    }

    if (blocked) {
      e.stopped = true
      const vel = e.entity.get(Velocity)
      if (vel) vel.z = 0
      // 一次性位置校正到最近前方 stopped 同类的身后 gap 处，
      // 并同步 entry.z，保证后续单位排队边界正确
      const pos = e.entity.get(Position)
      if (pos) {
        const minZ = nearestFrontZ - gap
        if (pos.z > minZ) {
          pos.z = minZ
          e.z = minZ
        }
      }
    }
  }
}
