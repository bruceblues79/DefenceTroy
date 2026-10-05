import { useEffect, useMemo, useState } from 'react'
import { Container, Text, Image } from '@react-three/uikit'
import { Button } from '@react-three/uikit-default'

const BASE = import.meta.env.BASE_URL
const ASSET_VERSION = 2
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
 * 轮次开场/结束提示面板（uikit 版）
 * 外层 group 固定旋转面朝上（俯视相机），内部 uikit Container 作圆角背景，
 * 文本与按钮均使用 uikit 组件，flexbox 排版。
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
    <group position={[0, 4, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* 背景面板 3.75×5m（width=375 height=500 @ pixelSize=0.01），中灰半透 */}
      <Container
        width={375}
        height={500}
        backgroundColor="#888888"
        opacity={0.8}
        borderRadius={19}
        flexDirection="column"
        alignItems="center"
        padding={24}
        gap={10}
      >
        {/* 标题 */}
        <Text fontSize={26} color="#ffffff" textAlign="center" width="100%">
          {title}
        </Text>

        {/* 正文 */}
        <Text fontSize={18} color="#e5e5e5" textAlign="center" width="100%" wordBreak="break-word">
          {body}
        </Text>

        {/* tips 标签 */}
        <Text fontSize={16} color="#ffd700">
          Tips
        </Text>

        {/* tip 正文（分页） */}
        {tip && (
          <Text fontSize={16} color="#ffd700" textAlign="center" width="100%" wordBreak="break-word">
            {tipPages[page]}
          </Text>
        )}

        {/* 页码 */}
        <Text fontSize={15} color="#a0a0a0">
          {`${page + 1} / ${tipPages.length}`}
        </Text>

        {/* 底部按钮行：prev / next / ok */}
        <Container flexDirection="row" width="100%" justifyContent="space-around" marginTop="auto">
          <Button
            width={75}
            height={75}
            borderRadius={10}
            backgroundColor={isFirst ? '#444444' : '#3b82f6'}
            hover={{ backgroundColor: isFirst ? '#444444' : '#2563eb' }}
            disabled={isFirst}
            onClick={isFirst ? undefined : handlePrev}
          >
            <Image src={ICON_PAGE_UP} width={52} height={52} />
          </Button>

          <Button
            width={75}
            height={75}
            borderRadius={10}
            backgroundColor={isLast ? '#444444' : '#3b82f6'}
            hover={{ backgroundColor: isLast ? '#444444' : '#2563eb' }}
            disabled={isLast}
            onClick={isLast ? undefined : handleNext}
          >
            <Image src={ICON_PAGE_DOWN} width={52} height={52} />
          </Button>

          <Button
            width={75}
            height={75}
            borderRadius={10}
            backgroundColor="#22c55e"
            hover={{ backgroundColor: '#16a34a' }}
            onClick={onOk}
          >
            <Image src={ICON_CHECK} width={52} height={52} />
          </Button>
        </Container>
      </Container>
    </group>
  )
}
