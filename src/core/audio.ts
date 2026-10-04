/**
 * 音效播放模块
 * 战斗音效使用 THREE.PositionalAudio（空间音频）。
 * 多音效 + 实例池：同音效可叠加播放；池满时抢占首实例 stop+play（打断）。
 *
 * 空间音频要求：
 * - AudioListener 必须挂载到相机（由 App.tsx 完成）
 * - PositionalAudio 实例必须加入场景图（audioAnchor group，由 App.tsx 挂载到 scene）
 */

import * as THREE from 'three'

export type SoundId =
  | 'bow'
  | 'spear'
  | 'hurt'
  | 'enemyDeath'
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
  bow: { url: `${BASE}assets/audio/bow-release.wav?v=7`, pool: 6 },
  spear: { url: `${BASE}assets/audio/spear-release.wav?v=7`, pool: 6 },
  hurt: { url: `${BASE}assets/audio/hurt.wav?v=7`, pool: 4, volume: 0.3 },
  enemyDeath: { url: `${BASE}assets/audio/enemy-death.wav?v=7`, pool: 4, volume: 0.5 },
  defenderDeath: { url: `${BASE}assets/audio/defender-death.wav?v=7`, pool: 4, volume: 0.5 },
  wallHit: { url: `${BASE}assets/audio/wall-hit.wav?v=7`, pool: 4 },
}

/** 空间音频参数（俯视相机 y=9，战场 x∈[-2.5,2.5] z∈[-5,5]） */
const SPATIAL_REF_DISTANCE = 8 // 8 米内音量不衰减，保证可闻
const SPATIAL_ROLLOFF_FACTOR = 0.6 // 衰减较缓，保留左右空间感

let listener: THREE.AudioListener | null = null
/** PositionalAudio 实例的挂载父节点，需由 App.tsx 添加到 scene */
const audioAnchor = new THREE.Group()
const buffers: Partial<Record<SoundId, AudioBuffer>> = {}
/** 空间池（bow/spear/hurt/enemyDeath/defenderDeath/wallHit） */
const posPools: Partial<Record<SoundId, THREE.PositionalAudio[]>> = {}
const loaded: Partial<Record<SoundId, boolean>> = {}

/** 获取 AudioListener（需挂载到相机） */
export function getListener(): THREE.AudioListener | null {
  return listener
}

/** 获取 PositionalAudio 挂载锚点（需添加到 scene） */
export function getAudioAnchor(): THREE.Group {
  return audioAnchor
}

/** 预加载所有音效 buffer 并创建实例池（应用启动时调用） */
export function preloadAudio(): void {
  if (listener) return
  listener = new THREE.AudioListener()
  const loader = new THREE.AudioLoader()

  for (const id of Object.keys(SOUNDS) as SoundId[]) {
    const { url, pool, volume = 1 } = SOUNDS[id]
    // 空间：THREE.PositionalAudio，挂载到 audioAnchor
    posPools[id] = Array.from({ length: pool }, () => {
      const s = new THREE.PositionalAudio(listener!)
      s.setVolume(volume)
      s.setRefDistance(SPATIAL_REF_DISTANCE)
      s.setRolloffFactor(SPATIAL_ROLLOFF_FACTOR)
      audioAnchor.add(s)
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
 * 由 App.tsx 全局监听首次 pointerdown 调用。
 */
export function unlockAudio(): void {
  if (!listener) return
  const ctx = listener.context
  if (ctx.state === 'suspended') {
    void ctx.resume()
  }
}

/**
 * 播放空间音效（战斗单位）。
 * 在指定 3D 位置播放，panner 位置由场景图每帧 updateMatrixWorld 自动更新。
 */
export function playPositionalSound(id: SoundId, position: [number, number, number]): void {
  if (!loaded[id] || !listener) return
  const pool = posPools[id]
  if (!pool || pool.length === 0) return

  let sound = pool.find((s) => !s.isPlaying)
  if (!sound) {
    sound = pool[0]
    if (sound.isPlaying) sound.stop()
  }
  sound.position.set(position[0], position[1], position[2])
  const buffer = buffers[id]
  if (buffer) sound.setBuffer(buffer)
  sound.play()
}
