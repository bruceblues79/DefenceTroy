import type { World } from 'koota'
import { Position, Velocity, Attack, IsEnemy, IsPrayer, UnitType, AttackSpeedBuff } from '../traits'
import type { UnitKind } from '../traits'
import { ENEMY_PRAYER_SPEED, ENEMY_PRAYER_WALL_Z, ENEMY_PRAYER_INTERVAL, ENEMY_PRAYER_CHANT } from '../actions'

/**
 * 敌方祷言师 AI 系统
 *
 * 状态机（Attack 字段自管，updateAttack 通过 IsPrayer early-return 跳过）：
 * - 登场 cooldown=INTERVAL=3s，先跑攻击间隔，期间不 buff 任何单位
 * - cooldown 期间移动判定：未到 wallZ → 继续移动；已到 wallZ → 不待机但不前进
 * - cooldown 跑完 → 立即进入 attack 状态：强制停下播 1.5s 动作，
 *   attack 开始瞬间 triggerBuff（施法瞬发，给己方随机 kind 攻速 buff）
 * - attack 播完 → 回到 cooldown=INTERVAL → 循环到死亡
 */
export function updateEnemyPrayerAI(world: World, dt: number) {
  const units = world.query(IsEnemy, IsPrayer, Position, Attack, Velocity)

  units.updateEach(([pos, attack, vel]) => {
    if (attack.isAttacking) {
      // attack 期间：强制停下播动作，attackTimer 流逝 CHANT 后回到 cooldown
      vel.x = 0
      vel.z = 0
      attack.attackTimer += dt
      if (attack.attackTimer >= ENEMY_PRAYER_CHANT) {
        attack.isAttacking = false
        attack.attackTimer = 0
        attack.cooldown = ENEMY_PRAYER_INTERVAL
      }
    } else {
      // cooldown 期间：cooldown 流逝
      if (attack.cooldown > 0) {
        attack.cooldown -= dt
      }
      // 移动判定：未到 wallZ 移动，已到 wallZ 不动（不待机）
      if (pos.z < ENEMY_PRAYER_WALL_Z) {
        vel.x = 0
        vel.z = ENEMY_PRAYER_SPEED
      } else {
        vel.x = 0
        vel.z = 0
      }
      // cooldown 跑完 → 开始 attack，施法瞬间触发 buff，强制停下
      if (attack.cooldown <= 0) {
        attack.isAttacking = true
        attack.attackTimer = 0
        triggerBuff(world)
        vel.x = 0
        vel.z = 0
      }
    }
  })
}

/**
 * 随机选一个攻方 kind（sapper/archer/pikeman/ram 之一），
 * 给该 kind 所有存活 IsEnemy 单位挂/刷新 AttackSpeedBuff。
 * koota add 对已挂 trait 是 no-op，必须 set 才能刷新 remaining。
 */
function triggerBuff(world: World) {
  const kinds: UnitKind[] = ['sapper', 'archer', 'pikeman', 'ram']
  const pick = kinds[Math.floor(Math.random() * kinds.length)]
  world.query(IsEnemy, UnitType).updateEach(([ut], e) => {
    if (ut.kind !== pick) return
    if (e.has(AttackSpeedBuff)) {
      e.set(AttackSpeedBuff, { multiplier: 0.5, remaining: 3 })
    } else {
      e.add(AttackSpeedBuff({ multiplier: 0.5, remaining: 3 }))
    }
  })
}
