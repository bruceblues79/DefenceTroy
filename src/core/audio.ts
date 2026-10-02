/**
 * 音效播放模块
 * 纯 Web Audio API，无第三方依赖。
 * 应用启动时预加载 AudioBuffer，点击时零延迟播放。
 */

const BOW_RELEASE_URL = `${import.meta.env.BASE_URL}assets/audio/bow-release.wav?v=2`

let ctx: AudioContext | null = null
let buffer: AudioBuffer | null = null
let loadingPromise: Promise<void> | null = null

function createCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext || (window as any).webkitAudioContext
  if (!Ctor) return null
  return new Ctor()
}

/**
 * 预加载音效 buffer。
 * 在应用启动时调用，提前 fetch + decode，点击时即可零延迟播放。
 * AudioContext 此时为 suspended 状态，不影响 decode；
 * 首次用户点击时 ensureCtx 会 resume。
 */
export function preloadAudio(): void {
  if (!ctx) ctx = createCtx()
  if (ctx && !buffer && !loadingPromise) {
    void loadBuffer()
  }
}

/**
 * 在最早的用户手势（pointerdown）中解锁 AudioContext。
 * 比 onClick 更早触发，给 resume 留足时间，确保 click 播放时无延迟。
 */
export function unlockAudio(): void {
  if (!ctx) ctx = createCtx()
  if (ctx && ctx.state === 'suspended') {
    void ctx.resume()
  }
}

/**
 * 获取 AudioContext，若 suspended 则 resume 并等待完成。
 * 首次用户点击时必须等 resume 完成再播放，否则 start() 会被推迟到 ctx running 之后。
 */
async function ensureCtx(): Promise<AudioContext | null> {
  if (!ctx) ctx = createCtx()
  if (!ctx) return null
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume()
    } catch {
      // resume 失败时仍返回 ctx，尝试播放
    }
  }
  return ctx
}

function loadBuffer(): Promise<void> {
  if (buffer) return Promise.resolve()
  if (loadingPromise) return loadingPromise
  loadingPromise = (async () => {
    if (!ctx) ctx = createCtx()
    if (!ctx) return
    const res = await fetch(BOW_RELEASE_URL)
    const arrayBuf = await res.arrayBuffer()
    buffer = await ctx.decodeAudioData(arrayBuf)
  })().catch(() => {
    loadingPromise = null // 失败后允许重试
  })
  return loadingPromise
}

/** 播放弓箭发射音效（按钮点击用） */
export async function playClick(): Promise<void> {
  const audioCtx = await ensureCtx()
  if (!audioCtx) return
  if (!buffer) {
    // buffer 尚未就绪（预加载未完成或未调用 preloadAudio），
    // 加载完成后立即补播一次
    await loadBuffer()
    if (buffer) playNow(audioCtx, buffer)
    return
  }
  playNow(audioCtx, buffer)
}

function playNow(audioCtx: AudioContext, buf: AudioBuffer): void {
  const src = audioCtx.createBufferSource()
  src.buffer = buf
  src.connect(audioCtx.destination)
  src.start(0)
}
