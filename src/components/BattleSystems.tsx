import { useFrame } from '@react-three/fiber'
import { useWorld } from 'koota/react'
import { useEffect, useRef } from 'react'
import {
  updateMovement,
  updateEnemyArcherAI,
  updateEnemyInfantryAI,
  updateDefenderArcherAI,
  updateAttack,
  updateProjectiles,
  updateDeath,
  createSpawnSystem,
  createInfantrySpawnSystem,
} from '../core/systems'
import { spawnActions, WALL_SLOTS } from '../core/actions'
import { IsWall, IsEnemy, IsDefender, IsProjectile } from '../core/traits'

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
  const infantrySpawnSystemRef = useRef<ReturnType<typeof createInfantrySpawnSystem> | null>(null)
  const initializedRef = useRef(false)
  const gameOverFiredRef = useRef(false)
  const battleReadyRef = useRef(false)

  // 初始化战场：生成城墙 + 2 只守军 + 启动刷怪
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    gameOverFiredRef.current = false
    battleReadyRef.current = false

    const actions = spawnActions(world)

    // 生成城墙
    actions.spawnWall()

    // 生成 2 只守军弓手（选 9 个点位中的第 3 和第 7 个，左右分布）
    actions.spawnDefenderArcher(WALL_SLOTS[2])
    actions.spawnDefenderArcher(WALL_SLOTS[6])

    // 初始化刷怪系统
    spawnSystemRef.current = createSpawnSystem()
    spawnSystemRef.current.start()

    // 初始化步兵刷怪系统（3 只，随机槽位）
    infantrySpawnSystemRef.current = createInfantrySpawnSystem()
    infantrySpawnSystemRef.current.start()

    // 标记战场就绪，允许 useFrame 逻辑执行
    battleReadyRef.current = true

    return () => {
      initializedRef.current = false
      battleReadyRef.current = false
      spawnSystemRef.current?.stop()
      infantrySpawnSystemRef.current?.stop()

      // 销毁所有战斗实体，防止重开/返回主菜单后残留（world 是全局单例）
      world.query(IsWall).forEach((e) => e.destroy())
      world.query(IsEnemy).forEach((e) => e.destroy())
      world.query(IsDefender).forEach((e) => e.destroy())
      world.query(IsProjectile).forEach((e) => e.destroy())
    }
  }, [world])

  useFrame((_, delta) => {
    if (paused || !battleReadyRef.current) return

    // 限制最大 delta，避免切换标签页后跳帧
    const dt = Math.min(delta, 0.1)

    // 系统执行顺序：AI → 攻击 → 移动 → 抛射物 → 死亡 → 刷怪
    updateEnemyArcherAI(world, dt)
    updateEnemyInfantryAI(world, dt)
    updateDefenderArcherAI(world, dt)
    updateAttack(world, dt)
    updateMovement(world, dt)
    updateProjectiles(world, dt)
    updateDeath(world, dt)
    spawnSystemRef.current?.update(world, dt)
    infantrySpawnSystemRef.current?.update(world, dt)

    // 城墙被毁或敌人全灭 → 触发 gameOver（只触发一次）
    if (!gameOverFiredRef.current) {
      const wall = world.queryFirst(IsWall)
      // 只在两类刷怪都完成后才检测敌人全灭
      const spawnDone =
        (spawnSystemRef.current?.isDone?.() ?? false) &&
        (infantrySpawnSystemRef.current?.isDone?.() ?? false)
      const enemies = spawnDone ? world.queryFirst(IsEnemy) : true
      if (!wall || !enemies) {
        gameOverFiredRef.current = true
        spawnSystemRef.current?.stop()
        infantrySpawnSystemRef.current?.stop()
        onGameOver?.()
      }
    }
  })

  return null
}
