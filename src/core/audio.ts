/**
 * 音效播放模块
 * 基于 THREE.Audio（drei PositionalAudio 的底层），非空间全局音频。
 * THREE.AudioListener 内部管理 AudioContext，THREE.Audio.play() 封装了播放逻辑。
 */

import * as THREE from 'three'

const BOW_RELEASE_URL = `${import.meta.env.BASE_URL}assets/audio/bow-release.wav?v=3`

let listener: THREE.AudioListener | null = null
let sound: THREE.Audio | null = null
let loaded = false

/** 预加载音效 buffer（应用启动时调用） */
export function preloadAudio(): void {
  if (listener) return
  listener = new THREE.AudioListener()
  sound = new THREE.Audio(listener)
  const loader = new THREE.AudioLoader()
  loader.load(
    BOW_RELEASE_URL,
    (buffer) => {
      sound!.setBuffer(buffer)
      loaded = true
    },
    undefined,
    () => {
      loaded = false
    },
  )
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

/** 播放弓箭发射音效（按钮点击用） */
export function playClick(): void {
  if (!sound || !loaded) return
  // 重置到开头再播放
  if (sound.isPlaying) {
    sound.stop()
  }
  sound.play()
}
