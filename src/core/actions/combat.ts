import { createActions, type Entity } from 'koota'
import { Health, Targeting } from '../traits'

export const combatActions = createActions((_world) => ({
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
}))
