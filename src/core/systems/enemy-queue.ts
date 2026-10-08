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
 * 从前到后（z 降序）逐个处理：对每个正在前进的单位，检查前方是否有
 * 同类型、同 x 列、已停止的同类兵且「本帧移动后」距离小于排队间距；
 * 若被阻挡则将 vel.z 置 0，使其排在前方同类兵身后等待。
 * 若已冲入 gap 内（前帧残留/卡顿跳帧），回退位置到 front.z - gap。
 *
 * 前到后处理确保停止状态逐级传播：第二个停 → 第三个立刻看到
 * 第二个已停并也停下，不再重叠。
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
    let blocked = false
    let blockerZ = 0

    // entries[0..i-1] 是前方的单位（z 降序排列）
    for (let j = 0; j < i; j++) {
      const front = entries[j]
      if (front.kind !== e.kind) continue
      if (Math.abs(front.x - e.x) > COLUMN_THRESHOLD) continue
      if (!front.stopped) continue
      // 基于「本帧移动后」的距离判定：防止放行后 movement 又把它推进 gap 内
      const projected = front.z - (e.z + e.velZ * dt)
      if (projected > gap) continue
      blocked = true
      blockerZ = front.z
      break
    }

    if (blocked) {
      e.stopped = true
      const vel = e.entity.get(Velocity)
      if (vel) vel.z = 0
      // 位置回退：若已冲入 gap 内（距离 < gap），拉回到 front.z - gap，
      // 防止残留位置造成的视觉重叠
      const pos = e.entity.get(Position)
      if (pos) {
        const minZ = blockerZ - gap
        if (pos.z > minZ) pos.z = minZ
      }
    }
  }
}
