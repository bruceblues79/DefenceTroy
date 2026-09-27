import { useEffect, useMemo, useState } from 'react'
import { Billboard, Text } from '@react-three/drei'
import RoundShapePlane from './RoundShapePlane'
import RoundedShapeButton from './RoundedShapeButton'
import { UI_FONT } from '../core/font'

const BASE = import.meta.env.BASE_URL
const ASSET_VERSION = 1
const ICON_PAGE_UP = `${BASE}assets/svg/icon-page-up.svg?v=${ASSET_VERSION}`
const ICON_PAGE_DOWN = `${BASE}assets/svg/icon-page-down.svg?v=${ASSET_VERSION}`
const ICON_CHECK = `${BASE}assets/svg/icon-check.svg?v=${ASSET_VERSION}`

/** 按词将正文切分为多页，每页约 maxChars 字（单页超长时整段放行） */
function paginate(text: string, maxChars = 120): string[] {
  const words = text.split(/\s+/)
  const pages: string[] = []
  let current = ''
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w
    if (candidate.length > maxChars && current) {
      pages.push(current)
      current = w
    } else {
      current = candidate
    }
  }
  if (current) pages.push(current)
  return pages.length ? pages : ['']
}

interface RoundPromptPanelProps {
  title: string
  body: string
  tip?: string
  /** 'intro' | 'ending'，仅用于区分是否显示操作提示 */
  onOk: () => void
}

/**
 * 轮次开场/结束提示面板
 * 复用 RoundShapePlane 作背景，上部显示标题/正文/操作提示/页码，下部 P/N/OK 三按钮。
 */
export default function RoundPromptPanel({ title, body, tip, onOk }: RoundPromptPanelProps) {
  // 翻页对象改为 tip 内容（正文简短，直接完整显示）
  const tipPages = useMemo(() => (tip ? paginate(tip) : ['']), [tip])
  const [page, setPage] = useState(0)
  const isFirst = page === 0
  const isLast = page === tipPages.length - 1

  // tip 切换时回到第一页
  useEffect(() => setPage(0), [tip])

  const handlePrev = () => setPage((p) => Math.max(0, p - 1))
  const handleNext = () => setPage((p) => Math.min(tipPages.length - 1, p + 1))

  return (
    <Billboard position={[0, 4, 0.5]}>
      {/* 背景面板 3.75×5（原 3×4 放大 25%），中灰半透 */}
      <RoundShapePlane width={3.75} height={5} cornerRadius={0.19} color="#888888" opacity={0.8} />

      {/* 上部内容区：标题 2/10 + 正文 3/10 + tip 5/10（内容区 y∈[-1.5,2.5]，高 4.0） */}
      <Text
        font={UI_FONT}
        position={[0, 2.1, 0.01]}
        fontSize={0.26}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={3.25}
        textAlign="center"
      >
        {title}
      </Text>

      <Text
        font={UI_FONT}
        position={[0, 1.1, 0.01]}
        fontSize={0.18}
        color="#e5e5e5"
        anchorX="center"
        anchorY="middle"
        maxWidth={3.25}
        textAlign="center"
        overflowWrap="break-word"
      >
        {body}
      </Text>

      {/* tip 区：column 布局 —— "tips" 固定在顶端居中，内容在下方 */}
      <Text
        font={UI_FONT}
        position={[0, 0.35, 0.01]}
        fontSize={0.1625}
        color="#ffd700"
        anchorX="center"
        anchorY="middle"
      >
        tips
      </Text>

      {tip && (
        <Text
          font={UI_FONT}
          position={[0, 0.12, 0.01]}
          fontSize={0.1625}
          color="#ffd700"
          anchorX="center"
          anchorY="top"
          maxWidth={3.25}
          textAlign="center"
          overflowWrap="break-word"
        >
          {tipPages[page]}
        </Text>
      )}

      <Text
        font={UI_FONT}
        position={[0, -1.4, 0.01]}
        fontSize={0.15}
        color="#a0a0a0"
        anchorX="center"
        anchorY="middle"
      >
        {`${page + 1} / ${tipPages.length}`}
      </Text>

      {/* 底部 20% 按钮区（y ∈ [-2.5, -1.5]）：三个方形按钮均分 */}
      <RoundedShapeButton
        position={[-1.125, -2.0, 0.02]}
        width={0.75}
        height={0.75}
        cornerRadius={0.1}
        color={isFirst ? '#444444' : '#3b82f6'}
        opacity={isFirst ? 0.5 : 1}
        image={ICON_PAGE_UP}
        imageScale={0.7}
        imageColor={isFirst ? '#aaaaaa' : '#ffffff'}
        onClick={isFirst ? undefined : handlePrev}
      />
      <RoundedShapeButton
        position={[0, -2.0, 0.02]}
        width={0.75}
        height={0.75}
        cornerRadius={0.1}
        color={isLast ? '#444444' : '#3b82f6'}
        opacity={isLast ? 0.5 : 1}
        image={ICON_PAGE_DOWN}
        imageScale={0.7}
        imageColor={isLast ? '#aaaaaa' : '#ffffff'}
        onClick={isLast ? undefined : handleNext}
      />
      <RoundedShapeButton
        position={[1.125, -2.0, 0.02]}
        width={0.75}
        height={0.75}
        cornerRadius={0.1}
        color="#22c55e"
        image={ICON_CHECK}
        imageScale={0.7}
        imageColor="#ffffff"
        onClick={onOk}
      />
    </Billboard>
  )
}
