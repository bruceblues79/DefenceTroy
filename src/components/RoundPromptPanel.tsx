import { useMemo, useState } from 'react'
import { Billboard, Text } from '@react-three/drei'
import RoundShapePlane from './RoundShapePlane'
import RoundedShapeButton from './RoundedShapeButton'

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
  const pages = useMemo(() => paginate(body), [body])
  const [page, setPage] = useState(0)
  const isFirst = page === 0
  const isLast = page === pages.length - 1

  const handlePrev = () => setPage((p) => Math.max(0, p - 1))
  const handleNext = () => setPage((p) => Math.min(pages.length - 1, p + 1))

  return (
    <Billboard position={[0, 4, 0.5]}>
      {/* 背景面板 3.75×5（原 3×4 放大 25%），中灰半透 */}
      <RoundShapePlane width={3.75} height={5} cornerRadius={0.19} color="#888888" opacity={0.8} />

      {/* 上部内容区（整体缩放 1.25） */}
      <Text
        position={[0, 1.875, 0.01]}
        fontSize={0.325}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={3.25}
        textAlign="center"
      >
        {title}
      </Text>

      <Text
        position={[0, 0.6875, 0.01]}
        fontSize={0.2}
        color="#e5e5e5"
        anchorX="center"
        anchorY="middle"
        maxWidth={3.25}
        textAlign="center"
      >
        {pages[page]}
      </Text>

      {tip && (
        <Text
          position={[0, -0.5625, 0.01]}
          fontSize={0.1625}
          color="#c8c8c8"
          anchorX="center"
          anchorY="middle"
          maxWidth={3.25}
          textAlign="center"
        >
          {tip}
        </Text>
      )}

      <Text
        position={[0, -1.35, 0.01]}
        fontSize={0.15}
        color="#a0a0a0"
        anchorX="center"
        anchorY="middle"
      >
        {`${page + 1} / ${pages.length}`}
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
