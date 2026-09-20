import { useMemo, useState } from 'react'
import { Billboard, Text } from '@react-three/drei'
import RoundShapePlane from './RoundShapePlane'
import RoundedShapeButton from './RoundedShapeButton'

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
      {/* 背景面板 3×4 */}
      <RoundShapePlane width={3} height={4} cornerRadius={0.15} color="#5a5a5a" />

      {/* 上部 90% 内容区 */}
      <Text
        position={[0, 1.5, 0.01]}
        fontSize={0.26}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.6}
        textAlign="center"
      >
        {title}
      </Text>

      <Text
        position={[0, 0.55, 0.01]}
        fontSize={0.16}
        color="#e5e5e5"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.6}
        textAlign="center"
      >
        {pages[page]}
      </Text>

      {tip && (
        <Text
          position={[0, -0.45, 0.01]}
          fontSize={0.13}
          color="#c8c8c8"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.6}
          textAlign="center"
        >
          {tip}
        </Text>
      )}

      <Text
        position={[0, -1.35, 0.01]}
        fontSize={0.12}
        color="#a0a0a0"
        anchorX="center"
        anchorY="middle"
      >
        {`${page + 1} / ${pages.length}`}
      </Text>

      {/* 下部 10% 按钮区：P / N / OK */}
      <RoundedShapeButton
        position={[-0.9, -1.8, 0.02]}
        width={0.7}
        height={0.35}
        cornerRadius={0.06}
        color={isFirst ? '#444444' : '#3b82f6'}
        opacity={isFirst ? 0.5 : 1}
        label="P"
        labelFontSize={0.18}
        onClick={isFirst ? undefined : handlePrev}
      />
      <RoundedShapeButton
        position={[0, -1.8, 0.02]}
        width={0.7}
        height={0.35}
        cornerRadius={0.06}
        color={isLast ? '#444444' : '#3b82f6'}
        opacity={isLast ? 0.5 : 1}
        label="N"
        labelFontSize={0.18}
        onClick={isLast ? undefined : handleNext}
      />
      <RoundedShapeButton
        position={[0.9, -1.8, 0.02]}
        width={0.7}
        height={0.35}
        cornerRadius={0.06}
        color="#22c55e"
        label="OK"
        labelFontSize={0.18}
        onClick={onOk}
      />
    </Billboard>
  )
}
