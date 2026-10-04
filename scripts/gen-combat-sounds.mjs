#!/usr/bin/env node
/**
 * 合成战斗音效 WAV（纯 Node.js，无外部依赖）
 *
 * 生成：
 *   spear-release.wav  —— 矛发射（低沉木质冲击 + 弦振）
 *   enemy-hurt.wav     —— 敌方受击闷哼
 *   enemy-death.wav    —— 敌方死亡下行嚎叫
 *   defender-hurt.wav  —— 守军受击哼叫（比敌方高）
 *   defender-death.wav —— 守军死亡嚎叫（比敌方亮）
 *   wall-hit.wav       —— 城墙受击（木质撞击）
 *
 * 输出：16-bit PCM WAV, 44100Hz, 单声道
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const SAMPLE_RATE = 44100
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

// ── 滤波器工具 ────────────────────────────────────────
function makeBandpass(f0, q) {
  const w0 = (2 * Math.PI * f0) / SAMPLE_RATE
  const alpha = Math.sin(w0) / (2 * q)
  const b0 = alpha, b1 = 0, b2 = -alpha
  const a0 = 1 + alpha, a1 = -2 * Math.cos(w0), a2 = 1 - alpha
  const nb0 = b0 / a0, nb1 = b1 / a0, nb2 = b2 / a0
  const na1 = a1 / a0, na2 = a2 / a0
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0
  return (x) => {
    const y = nb0 * x + nb1 * x1 + nb2 * x2 - na1 * y1 - na2 * y2
    x2 = x1; x1 = x; y2 = y1; y1 = y
    return y
  }
}

function makeLowpass(fc) {
  const dt = 1 / SAMPLE_RATE
  const rc = 1 / (2 * Math.PI * fc)
  const alpha = dt / (rc + dt)
  let y = 0
  return (x) => { y = y + alpha * (x - y); return y }
}

// ── WAV 写入 ──────────────────────────────────────────
function writeWav(path, floatSamples, sampleRate) {
  const numChannels = 1
  const bytesPerSample = 2
  const blockAlign = numChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = floatSamples.length * bytesPerSample
  const buffer = Buffer.alloc(44 + dataSize)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(numChannels, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(byteRate, 28)
  buffer.writeUInt16LE(blockAlign, 32)
  buffer.writeUInt16LE(bytesPerSample * 8, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)
  for (let i = 0; i < floatSamples.length; i++) {
    buffer.writeInt16LE(clamp(Math.round(floatSamples[i] * 32767), -32768, 32767), 44 + i * 2)
  }
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, buffer)
}

function normalizeAndFade(samples, fadeInMs = 2, fadeOutMs = 30) {
  let maxAbs = 0
  for (let i = 0; i < samples.length; i++) maxAbs = Math.max(maxAbs, Math.abs(samples[i]))
  const norm = maxAbs > 0 ? 0.9 / maxAbs : 1
  const fadeIn = Math.floor(fadeInMs / 1000 * SAMPLE_RATE)
  const fadeOut = Math.floor(fadeOutMs / 1000 * SAMPLE_RATE)
  const N = samples.length
  for (let i = 0; i < N; i++) {
    let s = samples[i] * norm
    if (i < fadeIn) s *= i / fadeIn
    if (i > N - fadeOut) s *= (N - i) / fadeOut
    samples[i] = clamp(s, -1, 1)
  }
  return samples
}

// ── 1. 矛发射 ─────────────────────────────────────────
function genSpearRelease() {
  const DURATION = 0.4
  const N = Math.floor(SAMPLE_RATE * DURATION)
  const samples = new Float64Array(N)

  for (let i = 0; i < N; i++) {
    const t = i / SAMPLE_RATE
    // 木质冲击瞬态：0~12ms 噪声爆发，加重
    let transient = 0
    if (t < 0.012) {
      transient = (Math.random() * 2 - 1) * Math.exp(-t / 0.0025) * 0.7
    }
    // 弦余振：基频 100Hz（比弓低），快速衰减
    let stringVib = 0
    if (t < 0.12) {
      const env = Math.exp(-t / 0.035)
      stringVib = (
        Math.sin(2 * Math.PI * 100 * t) * 0.6 +
        Math.sin(2 * Math.PI * 200 * t) * 0.25 +
        Math.sin(2 * Math.PI * 50 * t) * 0.2
      ) * env * 0.5
    }
    // 低频 thump
    let thump = 0
    if (t < 0.08) {
      thump = Math.sin(2 * Math.PI * 70 * t) * Math.exp(-t / 0.02) * 0.35
    }
    samples[i] = transient + stringVib + thump
  }

  // 矛飞行 whoosh：低带通，中心 800Hz
  const bp = makeBandpass(800, 4)
  for (let i = 0; i < N; i++) {
    const t = i / SAMPLE_RATE
    const filtered = bp(Math.random() * 2 - 1)
    const env = t < 0.008 ? t / 0.008 : Math.exp(-(t - 0.008) / 0.18)
    samples[i] += filtered * env * 0.25
  }

  return normalizeAndFade(samples)
}

// ── 2. 统一受击闷哼（敌我共用） ─────────────────────
function genHurt() {
  const DURATION = 0.08
  const N = Math.floor(SAMPLE_RATE * DURATION)
  const samples = new Float64Array(N)
  const bp = makeBandpass(400, 3)
  const lp = makeLowpass(700)

  for (let i = 0; i < N; i++) {
    const t = i / SAMPLE_RATE
    // 100Hz 基频 + 极快衰减（沉闷短促）
    const env = Math.exp(-t / 0.03)
    const vocal = Math.sin(2 * Math.PI * 100 * t) * env * 0.5
    // 带通噪声（喉音质感，中心 400Hz 更暗）
    const noise = bp(Math.random() * 2 - 1) * env * 0.3
    samples[i] = vocal + noise
  }
  // 低通压制高频，更沉闷
  for (let i = 0; i < N; i++) samples[i] = lp(samples[i])
  return normalizeAndFade(samples, 1, 5)
}

// ── 3. 敌方死亡嚎叫（ahhaaa 人声风） ──────────────────
// 锯齿波（声带）→ 双谐振峰带通（模拟 "ah" 元音音色）→ 低通压暗
function genEnemyDeath() {
  const DURATION = 0.5
  const N = Math.floor(SAMPLE_RATE * DURATION)
  const samples = new Float64Array(N)

  // 双谐振峰：F1（口腔）~ 600Hz，F2（咽腔）~ 950Hz —— 偏低，音色暗淡
  const f1 = makeBandpass(600, 6)
  const f2 = makeBandpass(950, 5)
  const lp = makeLowpass(1600) // 压暗高频，去掉尖锐气声

  for (let i = 0; i < N; i++) {
    const t = i / SAMPLE_RATE
    // 下行基频：280Hz → 70Hz（ah-haa 的下滑哀嚎）
    const freq = 280 - (280 - 70) * (t / DURATION)
    const phase = 2 * Math.PI * freq * t
    // 锯齿波（声带振动近似）
    const saw = ((phase % (2 * Math.PI)) / Math.PI - 1) * 0.5
    // 双 formant 串联 → "ah" 元音音色
    const formant = f2(f1(saw))
    // 慢速衰减包络
    const env = Math.exp(-t / 0.4)
    samples[i] = formant * env * 1.2
  }

  // 整体低通压暗
  for (let i = 0; i < N; i++) samples[i] = lp(samples[i])
  return normalizeAndFade(samples)
}

// ── 5. 守军死亡嚎叫（ahhaaa 人声风，比敌方亮但仍压暗） ─
function genDefenderDeath() {
  const DURATION = 0.45
  const N = Math.floor(SAMPLE_RATE * DURATION)
  const samples = new Float64Array(N)

  // 比敌方略高：F1 ~ 700Hz，F2 ~ 1100Hz
  const f1 = makeBandpass(700, 6)
  const f2 = makeBandpass(1100, 5)
  const lp = makeLowpass(1800)

  for (let i = 0; i < N; i++) {
    const t = i / SAMPLE_RATE
    const freq = 420 - (420 - 110) * (t / DURATION)
    const phase = 2 * Math.PI * freq * t
    const saw = ((phase % (2 * Math.PI)) / Math.PI - 1) * 0.5
    const formant = f2(f1(saw))
    const env = Math.exp(-t / 0.35)
    samples[i] = formant * env * 1.2
  }

  for (let i = 0; i < N; i++) samples[i] = lp(samples[i])
  return normalizeAndFade(samples)
}

// ── 6. 城墙受击 ───────────────────────────────────────
function genWallHit() {
  const DURATION = 0.2
  const N = Math.floor(SAMPLE_RATE * DURATION)
  const samples = new Float64Array(N)
  const lp = makeLowpass(800)

  for (let i = 0; i < N; i++) {
    const t = i / SAMPLE_RATE
    // 低频 thump：90Hz 正弦
    const thump = Math.sin(2 * Math.PI * 90 * t) * Math.exp(-t / 0.04) * 0.5
    // 木质撞击噪声：低通滤波
    const impact = lp(Math.random() * 2 - 1) * Math.exp(-t / 0.02) * 0.6
    // 木质共振：200Hz 衰减正弦
    const resonance = Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t / 0.05) * 0.2
    samples[i] = thump + impact + resonance
  }
  return normalizeAndFade(samples, 1, 15)
}

// ── 主流程 ────────────────────────────────────────────
const outDir = 'public/assets/audio'
const sounds = [
  ['spear-release.wav', genSpearRelease],
  ['hurt.wav', genHurt],
  ['enemy-death.wav', genEnemyDeath],
  ['defender-death.wav', genDefenderDeath],
  ['wall-hit.wav', genWallHit],
]

for (const [name, gen] of sounds) {
  const samples = gen()
  const outPath = `${outDir}/${name}`
  writeWav(outPath, samples, SAMPLE_RATE)
  console.log(`已生成 ${outPath}（${(samples.length / SAMPLE_RATE).toFixed(3)}s）`)
}
console.log(`\n共生成 ${sounds.length} 个战斗音效`)
