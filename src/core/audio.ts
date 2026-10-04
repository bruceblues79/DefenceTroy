/**
 * 音效播放模块
 * 基于 THREE.Audio（drei PositionalAudio 的底层），非空间全局音频。
 * 多音效 + 实例池：同音效可叠加播放；池满时抢占首实例 stop+play（打断）。
 */

import * as THREE from 'three'

export type SoundId =
  | 'bow'
  | 'spear'
  | 'enemyHurt'
  | 'enemyDeath'
  | 'defenderHurt'
  | 'defenderDeath'
  | 'wallHit'

const BASE = import.meta.env.BASE_URL

interface SoundConfig {
  url: string
  pool: number
  volume?: number
}

/** 音效注册表：url + 池大小 + 音量（缺省 1.0） */
const SOUNDS: Record<SoundId, SoundConfig> = {
  bow: { url: `${BASE}assets/audio/bow-release.wav?v=5`, pool: 6 },
  spear: { url: `${BASE}assets/audio/spear-release.wav?v=5`, pool: 6 },
  enemyHurt: { url: `${BASE}assets/audio/enemy-hurt.wav?v=5`, pool: 4 },
  enemyDeath: { url: `${BASE}assets/audio/enemy-death.wav?v=5`, pool: 4, volume: 0.5 },
  defenderHurt: { url: `${BASE}assets/audio/defender-hurt.wav?v=5`, pool: 4 },
  defenderDeath: { url: `${BASE}assets/audio/defender-death.wav?v=5`, pool: 4, volume: 0.5 },
  wallHit: { url: `${BASE}assets/audio/wall-hit.wav?v=5`, pool: 4 },
}

let listener: THREE.AudioListener | null = null
const buffers: Partial<Record<SoundId, AudioBuffer>> = {}
const pools: Partial<Record<SoundId, THREE.Audio[]>> = {}
const loaded: Partial<Record<SoundId, boolean>> = {}

/** 预加载所有音效 buffer 并创建实例池（应用启动时调用） */
export function preloadAudio(): void {
  if (listener) return
  listener = new THREE.AudioListener()
  const loader = new THREE.AudioLoader()

  for (const id of Object.keys(SOUNDS) as SoundId[]) {
    const { url, pool, volume = 1 } = SOUNDS[id]
    pools[id] = Array.from({ length: pool }, () => {
      const s = new THREE.Audio(listener!)
      s.setVolume(volume)
      return s
    })
    loader.load(
      url,
      (buffer) => {
        buffers[id] = buffer
        loaded[id] = true
      },
      undefined,
      () => {
        loaded[id] = false
      },
    )
  }
}

/**
 * 在最早的用户手势（pointerdown）中解锁 AudioContext。
 */
export function unlockAudio(): void {
  if (!listener) return
  const ctx = listener.context
  if (ctx.state === 'suspended') {
    void ctx.resume()
  }
}

/**
 * 播放指定音效。
 * - 优先使用池中空闲（!isPlaying）实例
 * - 池满时抢占首实例：stop + 重设 buffer + play（打断前次播放）
 */
export function playSound(id: SoundId): void {
  if (!loaded[id] || !listener) return
  const pool = pools[id]
  if (!pool || pool.length === 0) return

  let sound = pool.find((s) => !s.isPlaying)
  if (!sound) {
    sound = pool[0]
    if (sound.isPlaying) sound.stop()
  }
  const buffer = buffers[id]
  if (buffer) sound.setBuffer(buffer)
  sound.play()
}

/** 播放按钮点击音效（复用 bow 音） */
export function playClick(): void {
  playSound('bow')
}
