import type { World } from 'koota'
import { spawnActions, ENEMY_SPAWN_X, ENEMY_SPAWN_Z } from '../actions'
import { type EnemyType, type RoundConfig } from './rounds.config'

export type RoundPhase = 'intro' | 'spawning' | 'waiting' | 'clearing' | 'ending' | 'done'

export interface RoundEngineCallbacks {
  /** 新一轮开场提示应显示 */
  onIntro: (round: RoundConfig, index: number) => void
  /** 当前轮完成，结束语与整备金应显示（整备金由调用方在此回调发放） */
  onEnding: (round: RoundConfig, index: number) => void
  /** 最后一轮结束语已确认，游戏胜利 */
  onAllDone: () => void
}

interface SpawnUnit {
  type: EnemyType
  x: number
}

interface InternalWave {
  units: SpawnUnit[]
  interval: number
}

/**
 * 轮次状态机
 * 由配置驱动，负责：小波发兵、小波间等待、清场检测、轮次流转。
 * 不直接判胜负——胜利由 onAllDone 触发，失败由外部检测后调用 stop()。
 */
export function createRoundEngine(configs: RoundConfig[], cb: RoundEngineCallbacks) {
  let roundIdx = 0
  let waveIdx = 0
  let phase: RoundPhase = 'intro'
  let spawnTimer = 0
  let spawned = 0
  let waitTimer = 0
  let wave: InternalWave | null = null
  let finished = false

  /** 将小波的敌军配置展开为带随机槽位的生成序列 */
  const buildWave = (round: RoundConfig, idx: number): InternalWave => {
    const w = round.waves[idx]
    const slots = [...ENEMY_SPAWN_X].sort(() => Math.random() - 0.5)
    const units: SpawnUnit[] = []
    let slotIdx = 0
    for (const e of w.enemies) {
      for (let i = 0; i < e.count; i++) {
        units.push({ type: e.type, x: slots[slotIdx % slots.length] })
        slotIdx++
      }
    }
    return { units, interval: w.spawnInterval }
  }

  const spawnUnit = (world: World, type: EnemyType, x: number) => {
    const actions = spawnActions(world)
    if (type === 'sapper') actions.spawnEnemySapper(x, ENEMY_SPAWN_Z)
    else if (type === 'archer') actions.spawnEnemyArcher(x, ENEMY_SPAWN_Z)
    else actions.spawnEnemyPikeman(x, ENEMY_SPAWN_Z)
  }

  return {
    /** 启动：显示第一轮开场 */
    start() {
      roundIdx = 0
      waveIdx = 0
      phase = 'intro'
      spawnTimer = 0
      spawned = 0
      waitTimer = 0
      wave = null
      finished = false
      cb.onIntro(configs[0], 0)
    },

    /** 玩家确认开场提示：开始第一波 */
    confirmIntro() {
      if (finished || phase !== 'intro') return
      waveIdx = 0
      wave = buildWave(configs[roundIdx], 0)
      spawnTimer = 0
      spawned = 0
      phase = 'spawning'
    },

    /** 外部检测到清场完成（最后一波发兵完且无敌军）：显示结束语 */
    completeRound() {
      if (finished || phase !== 'clearing') return
      phase = 'ending'
      cb.onEnding(configs[roundIdx], roundIdx)
    },

    /** 玩家确认结束语：进入下一轮或胜利 */
    confirmEnding() {
      if (finished || phase !== 'ending') return
      if (roundIdx < configs.length - 1) {
        roundIdx++
        waveIdx = 0
        wave = null
        phase = 'intro'
        cb.onIntro(configs[roundIdx], roundIdx)
      } else {
        finished = true
        phase = 'done'
        cb.onAllDone()
      }
    },

    /** 每帧驱动发兵与小波间等待（暂停时外部不调用 update） */
    update(world: World, dt: number) {
      if (finished) return
      if (phase !== 'spawning' && phase !== 'waiting') return

      if (phase === 'spawning' && wave) {
        spawnTimer += dt
        while (spawned < wave.units.length && spawnTimer >= wave.interval) {
          spawnTimer -= wave.interval
          const u = wave.units[spawned]
          spawnUnit(world, u.type, u.x)
          spawned++
        }
        if (spawned >= wave.units.length) {
          // 当前小波发兵完毕
          if (waveIdx < configs[roundIdx].waves.length - 1) {
            phase = 'waiting'
            waitTimer = 0
          } else {
            // 最后一波发兵完毕，等待清场
            phase = 'clearing'
          }
        }
      } else if (phase === 'waiting') {
        waitTimer += dt
        if (waitTimer >= configs[roundIdx].waveGap) {
          waveIdx++
          wave = buildWave(configs[roundIdx], waveIdx)
          spawnTimer = 0
          spawned = 0
          phase = 'spawning'
        }
      }
    },

    /** 外部判定失败时调用，停止一切发兵与流转 */
    stop() {
      finished = true
      phase = 'done'
    },

    isClearing() {
      return phase === 'clearing'
    },

    getPhase() {
      return phase
    },
  }
}

export type RoundEngine = ReturnType<typeof createRoundEngine>
