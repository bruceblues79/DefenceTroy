import { useFrame } from '@react-three/fiber'
import { useWorld } from 'koota/react'
import { useEffect, useRef } from 'react'
import {
  updateMovement,
  updateEnemyArcherAI,
  updateDefenderArcherAI,
  updateAttack,
  updateProjectiles,
  updateDeath,
  createSpawnSystem,
} from '../core/systems'
import { spawnActions, WALL_SLOTS } from '../core/actions'
import { IsWall } from '../core/traits'

interface BattleSystemsProps {
  paused?: boolean
  onGameOver?: () => void
}

/**
 * 战斗系统驱动组件
 * 在 useFrame 中按顺序执行所有 ECS 系统
 * 返回 null，不渲染任何内容
 */
export default function BattleSystems({ paused = false, onGameOver }: BattleSystemsProps) {
  const world = useWorld()
  const spawnSystemRef = useRef<ReturnType<typeof createSpawnSystem> | null>(null)
  const initializedRef = useRef(false)
  const gameOverFiredRef = useRef(false)

  // 初始化战场：生成城墙 + 2 只守军 + 启动刷怪
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    gameOverFiredRef.current = false

    const actions = spawnActions(world)

    // 生成城墙
    actions.spawnWall()

    // 生成 2 只守军弓手（选 9 个点位中的第 3 和第 7 个，左右分布）
    actions.spawnDefenderArcher(WALL_SLOTS[2])
    actions.spawnDefenderArcher(WALL_SLOTS[6])

    // 初始化刷怪系统
    spawnSystemRef.current = createSpawnSystem()
    spawnSystemRef.current.start()

    return () => {
      initializedRef.current = false
      spawnSystemRef.current?.stop()
    }
  }, [world])

  useFrame((_, delta) => {
    if (paused) return

    // 限制最大 delta，避免切换标签页后跳帧
    const dt = Math.min(delta, 0.1)

    // 系统执行顺序：AI → 攻击 → 移动 → 抛射物 → 死亡 → 刷怪
    updateEnemyArcherAI(world, dt)
    updateDefenderArcherAI(world, dt)
    updateAttack(world, dt)
    updateMovement(world, dt)
    updateProjectiles(world, dt)
    updateDeath(world, dt)
    spawnSystemRef.current?.update(world, dt)

    // 城墙不存在 → 触发 gameOver（只触发一次）
    if (!gameOverFiredRef.current) {
      const wall = world.queryFirst(IsWall)
      if (!wall) {
        gameOverFiredRef.current = true
        spawnSystemRef.current?.stop()
        onGameOver?.()
      }
    }
  })

  return null
}
