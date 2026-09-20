import { useFrame } from '@react-three/fiber'
import { useWorld } from 'koota/react'
import { useEffect, useRef } from 'react'
import {
  updateMovement,
  updateEnemyArcherAI,
  updateEnemyInfantryAI,
  updateEnemySpearmanAI,
  updateDefenderArcherAI,
  updateDefenderSpearmanAI,
  updateCatapultBombard,
  updateAttack,
  updateProjectiles,
  updateBoulders,
  updateEffects,
  updateDeath,
} from '../core/systems'
import { spawnActions, WALL_SLOTS } from '../core/actions'
import { IsWall, IsEnemy, IsDefender, IsProjectile, IsBoulder, IsEffect, Health, Reward } from '../core/traits'
import type { RoundEngine } from '../core/rounds/rounds-engine'

interface BattleSystemsProps {
  paused?: boolean
  engine: RoundEngine
  /** 兵营中守军总数，用于「无守军且无兵营」失败判定 */
  barracksDefenderCount: number
  onGameOver?: (result: 'victory' | 'defeat') => void
  /** 击杀敌人奖励金币回调（按死亡敌人的 Reward trait 累加） */
  onRewardGained?: (gold: number) => void
}

/**
 * 战斗系统驱动组件
 * 在 useFrame 中按顺序执行所有 ECS 系统，并驱动轮次引擎。
 * 返回 null，不渲染任何内容。
 */
export default function BattleSystems({ paused = false, engine, barracksDefenderCount, onGameOver, onRewardGained }: BattleSystemsProps) {
  const world = useWorld()
  const initializedRef = useRef(false)
  const gameOverFiredRef = useRef(false)
  const battleReadyRef = useRef(false)

  // 初始化战场：生成城墙 + 2 弓兵 + 启动轮次引擎
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    gameOverFiredRef.current = false
    battleReadyRef.current = false

    const actions = spawnActions(world)

    // 生成城墙
    actions.spawnWall()

    // 初始守军：2 弓兵
    actions.spawnDefenderArcher(WALL_SLOTS[3])
    actions.spawnDefenderArcher(WALL_SLOTS[5])

    // 启动轮次引擎（触发第一轮开场提示）
    engine.start()

    // 标记战场就绪，允许 useFrame 逻辑执行
    battleReadyRef.current = true

    return () => {
      initializedRef.current = false
      battleReadyRef.current = false
      engine.stop()

      // 销毁所有战斗实体，防止重开/返回主菜单后残留（world 是全局单例）
      world.query(IsWall).forEach((e) => e.destroy())
      world.query(IsEnemy).forEach((e) => e.destroy())
      world.query(IsDefender).forEach((e) => e.destroy())
      world.query(IsProjectile).forEach((e) => e.destroy())
      world.query(IsBoulder).forEach((e) => e.destroy())
      world.query(IsEffect).forEach((e) => e.destroy())
    }
  }, [world, engine])

  useFrame((_, delta) => {
    if (paused || !battleReadyRef.current) return

    // 限制最大 delta，避免切换标签页后跳帧
    const dt = Math.min(delta, 0.1)

    // 系统执行顺序：AI → 攻击 → 移动 → 抛射物 → 死亡
    updateEnemyArcherAI(world, dt)
    updateEnemyInfantryAI(world, dt)
    updateEnemySpearmanAI(world, dt)
    updateDefenderArcherAI(world, dt)
    updateDefenderSpearmanAI(world, dt)
    updateCatapultBombard(world, dt)
    updateAttack(world, dt)
    updateMovement(world, dt)
    updateProjectiles(world, dt)
    updateBoulders(world, dt)
    updateEffects(world, dt)
    const goldBefore = world.query(IsEnemy, Reward).reduce((s, e) => s + e.get(Reward)!.value, 0)
    updateDeath(world, dt)
    // 击杀产金：按 Reward trait 累加 updateDeath 前后差值
    const goldAfter = world.query(IsEnemy, Reward).reduce((s, e) => s + e.get(Reward)!.value, 0)
    const goldGained = goldBefore - goldAfter
    if (goldGained > 0) onRewardGained?.(goldGained)

    // 轮次引擎：发兵 / 小波间等待
    engine.update(world, dt)

    // 最后一波发兵完毕且场上无敌军 → 本轮完成（显示结束语）
    if (engine.isClearing() && !world.queryFirst(IsEnemy)) {
      engine.completeRound()
    }

    // 失败判定（只触发一次）
    if (!gameOverFiredRef.current) {
      const wall = world.queryFirst(IsWall)
      const wallHealth = wall?.get(Health)
      const wallDestroyed = !wallHealth || wallHealth.current <= 0
      const noDefenders = world.query(IsDefender).length === 0
      const noBarracks = barracksDefenderCount === 0

      if (wallDestroyed || (noDefenders && noBarracks)) {
        gameOverFiredRef.current = true
        engine.stop()
        onGameOver?.('defeat')
      }
    }
  })

  return null
}
