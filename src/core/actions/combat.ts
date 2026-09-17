import { createActions, type Entity } from 'koota'
import { Health, Targeting, Position, Attack } from '../traits'

/** 重置单位战斗状态（攻击计时归零，清除目标，由下一帧 AI 系统重新寻敌/周期） */
function resetUnitCombatState(entity: Entity) {
  const attack = entity.get(Attack)
  if (attack) entity.set(Attack, { cooldown: 0, attackTimer: 0, isAttacking: false, hasFired: false })
  if (entity.targetFor(Targeting)) entity.remove(Targeting('*'))
}

export const combatActions = createActions((world) => ({
  /** 对实体造成伤害 */
  dealDamage(entity: Entity, amount: number) {
    const health = entity.get(Health)
    if (!health) return
    const newHp = Math.max(0, health.current - amount)
    entity.set(Health, { current: newHp })
  },

  /** 清除实体的目标指向 */
  clearTarget(entity: Entity) {
    if (entity.targetFor(Targeting)) {
      entity.remove(Targeting('*'))
    }
  },

  /** 设置目标 */
  setTarget(entity: Entity, target: Entity) {
    entity.add(Targeting(target))
  },

  /** 销毁实体 */
  destroyEntity(entity: Entity) {
    entity.destroy()
  },

  /** 移动单位到新 slot x（保持 y/z），重置战斗状态 */
  moveUnitToSlot(entity: Entity, slotX: number) {
    const pos = entity.get(Position)
    if (pos) entity.set(Position, { x: slotX, y: pos.y, z: pos.z })
    resetUnitCombatState(entity)
  },

  /** 交换两单位位置（双方都重置战斗状态） */
  swapUnitPositions(entityA: Entity, entityB: Entity) {
    const a = entityA.get(Position)
    const b = entityB.get(Position)
    if (!a || !b) return
    entityA.set(Position, { x: b.x, y: a.y, z: a.z })
    entityB.set(Position, { x: a.x, y: b.y, z: b.z })
    resetUnitCombatState(entityA)
    resetUnitCombatState(entityB)
  },

  /** 销毁守军单位（回收路径）：清理所有指向它的 Targeting 后 destroy */
  recycleDefenderUnit(entity: Entity) {
    world.query(Targeting(entity)).readEach((_, attacker) => {
      attacker.remove(Targeting('*'))
    })
    entity.destroy()
  },
}))
