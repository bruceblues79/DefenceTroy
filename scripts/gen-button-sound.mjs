#!/usr/bin/env node
/**
 * 合成传统 UI 按钮点击音效
 *
 * 双层叠加：
 *   1. Tick：2000Hz 正弦脉冲，10ms，1.5ms 衰减 → 清脆高频
 *   2. Thud：150Hz 正弦，50ms，20ms 衰减 → 低频主体
 *
 * 输出：16-bit PCM WAV, 44100Hz, 单声道, 约 0.05s
 * 无外部依赖，纯 Node.js
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const SAMPLE_RATE = 44100
const DURATION = 0.05
const N = Math.floor(SAMPLE_RATE * DURATION)
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

const samples = new Float64Array(N)

for (let i = 0; i < N; i++) {
  const t = i / SAMPLE_RATE

  // 1. Tick：2000Hz 正弦脉冲，1.5ms 快速衰减
  const tickEnv = Math.exp(-t / 0.0015)
  const tick = Math.sin(2 * Math.PI * 2000 * t) * tickEnv * 0.4

  // 2. Thud：150Hz 正弦，20ms 衰减
  const thudEnv = Math.exp(-t / 0.02)
  const thud = Math.sin(2 * Math.PI * 150 * t) * thudEnv * 0.5

  samples[i] = tick + thud
}

// ── 归一化 + 淡入淡出 ─────────────────────────────────
let maxAbs = 0
for (let i = 0; i < N; i++) maxAbs = Math.max(maxAbs, Math.abs(samples[i]))
const norm = maxAbs > 0 ? 0.9 / maxAbs : 1
const fadeIn = Math.floor(0.001 * SAMPLE_RATE)
const fadeOut = Math.floor(0.005 * SAMPLE_RATE)
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

const outPath = 'public/assets/audio/button-click.wav'
writeWav(outPath, samples, SAMPLE_RATE)
console.log(`已生成 ${outPath}（${DURATION}s, ${SAMPLE_RATE}Hz, 16-bit PCM, 单声道）`)
