#!/usr/bin/env node
/**
 * 合成弓箭发射音效（拉满弓弦 → 松弦 → 箭离弦呼啸）
 *
 * 三层叠加：
 *   1. 弓弦瞬态(0~15ms)：白噪声 × 指数衰减  → "啪"的释放冲击
 *   2. 弦余振(0~120ms)：多谐波正弦叠加(基频~320Hz) × 快速衰减 → 弦振动
 *   3. 箭啸声(10~400ms)：带通滤波白噪声，中心频率 4kHz→1kHz 下滑，幅度衰减
 *
 * 输出：16-bit PCM WAV, 44100Hz, 单声道, 约 0.45s
 * 无外部依赖，纯 Node.js
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const SAMPLE_RATE = 44100
const DURATION = 0.3 // 秒（缩短，更紧凑）
const N = Math.floor(SAMPLE_RATE * DURATION)

// ── 工具 ──────────────────────────────────────────────
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

// 简单带通滤波：二阶 IIR（中心频率 f0，Q 值）
// 用状态变量滤波器实现
function makeBandpass(f0, q) {
  const w0 = (2 * Math.PI * f0) / SAMPLE_RATE
  const alpha = Math.sin(w0) / (2 * q)
  const b0 = alpha
  const b1 = 0
  const b2 = -alpha
  const a0 = 1 + alpha
  const a1 = -2 * Math.cos(w0)
  const a2 = 1 - alpha
  // 归一化
  const nb0 = b0 / a0, nb1 = b1 / a0, nb2 = b2 / a0
  const na1 = a1 / a0, na2 = a2 / a0
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0
  return (x) => {
    const y = nb0 * x + nb1 * x1 + nb2 * x2 - na1 * y1 - na2 * y2
    x2 = x1; x1 = x; y2 = y1; y1 = y
    return y
  }
}

// ── 合成 ──────────────────────────────────────────────
const samples = new Float64Array(N)

for (let i = 0; i < N; i++) {
  const t = i / SAMPLE_RATE // 秒

  // 1. 弓弦瞬态：0~15ms 的白噪声爆发，指数衰减（更尖锐）
  let transient = 0
  if (t < 0.015) {
    const env = Math.exp(-t / 0.0015) // 1.5ms 时间常数（更尖锐的"啪"）
    transient = (Math.random() * 2 - 1) * env * 0.6
  }

  // 2. 弦余振：多谐波正弦，快速衰减（减少低沉拖沓感）
  let stringVib = 0
  if (t < 0.08) {
    const env = Math.exp(-t / 0.03) // 30ms 时间常数
    const f0 = 150 // 基频 Hz
    stringVib = (
      Math.sin(2 * Math.PI * f0 * t) * 0.55 +
      Math.sin(2 * Math.PI * f0 * 2 * t) * 0.22 +
      Math.sin(2 * Math.PI * f0 * 3 * t) * 0.10 +
      Math.sin(2 * Math.PI * f0 * 0.5 * t) * 0.18
    ) * env * 0.3 // 幅度 0.45→0.3（减弱拖沓）
  }

  // 2b. 低频"咚"：80Hz 正弦，快速衰减（减弱厚重感）
  let thump = 0
  if (t < 0.08) {
    const env = Math.exp(-t / 0.02)
    thump = Math.sin(2 * Math.PI * 80 * t) * env * 0.15
  }

  samples[i] = transient + stringVib + thump
}

// 3. 箭啸声：带通滤波白噪声，中心频率 3000→600Hz 快速下滑（"嗖"的穿透感）
const whoosh = new Float64Array(N)
for (let i = 0; i < N; i++) {
  whoosh[i] = Math.random() * 2 - 1
}

// 频率下滑式带通：0.15s 内 3000Hz → 600Hz 线性下滑，Q=8
const SWEEP_DUR = 0.15
const F_START = 3000
const F_END = 600
let bpSweep = null
for (let i = 0; i < N; i++) {
  const t = i / SAMPLE_RATE
  // 每 ~300 采样更新一次带通中心频率（避免逐采样重建滤波器开销）
  if (i % 300 === 0 || i === 0) {
    const progress = Math.min(t / SWEEP_DUR, 1)
    const freq = F_START + (F_END - F_START) * progress
    bpSweep = makeBandpass(freq, 8)
  }
  const filtered = bpSweep(whoosh[i])
  // 幅度包络：5ms 起音，之后快速衰减（更干脆）
  const env = t < 0.005 ? t / 0.005 : Math.exp(-(t - 0.005) / 0.12)
  samples[i] += filtered * env * 0.35
}

// ── 归一化到 [-1, 1] 并加轻微淡入淡出 ────────────────
let maxAbs = 0
for (let i = 0; i < N; i++) maxAbs = Math.max(maxAbs, Math.abs(samples[i]))
const norm = maxAbs > 0 ? 0.9 / maxAbs : 1
const fadeIn = Math.floor(0.002 * SAMPLE_RATE) // 2ms 淡入
const fadeOut = Math.floor(0.03 * SAMPLE_RATE) // 30ms 淡出

for (let i = 0; i < N; i++) {
  let s = samples[i] * norm
  if (i < fadeIn) s *= i / fadeIn
  if (i > N - fadeOut) s *= (N - i) / fadeOut
  samples[i] = clamp(s, -1, 1)
}

// ── 写 WAV ────────────────────────────────────────────
function writeWav(path, floatSamples, sampleRate) {
  const numChannels = 1
  const bytesPerSample = 2
  const blockAlign = numChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = floatSamples.length * bytesPerSample
  const buffer = Buffer.alloc(44 + dataSize)

  // RIFF header
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  // fmt chunk
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16) // chunk size
  buffer.writeUInt16LE(1, 20) // PCM
  buffer.writeUInt16LE(numChannels, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(byteRate, 28)
  buffer.writeUInt16LE(blockAlign, 32)
  buffer.writeUInt16LE(bytesPerSample * 8, 34)
  // data chunk
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  for (let i = 0; i < floatSamples.length; i++) {
    const v = Math.round(floatSamples[i] * 32767)
    buffer.writeInt16LE(clamp(v, -32768, 32767), 44 + i * 2)
  }

  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, buffer)
}

const outPath = 'public/assets/audio/bow-release.wav'
writeWav(outPath, samples, SAMPLE_RATE)
console.log(`已生成 ${outPath}（${DURATION}s, ${SAMPLE_RATE}Hz, 16-bit PCM, 单声道）`)
