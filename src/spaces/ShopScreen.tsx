import { useState } from 'react'
import { Container, Text, Image } from '@react-three/uikit'
import { Button } from '@react-three/uikit-default'

export type UnitType = 'bow' | 'spear'

const BASE = import.meta.env.BASE_URL

// 商店专属图标缓存破坏版本号（首次部署 = 1，未来改图标时递增）
const SHOP_ASSET_VERSION = 1
const HIRE_TAB_ICON = `${BASE}assets/svg/icon-hire.svg?v=${SHOP_ASSET_VERSION}`
const MIRACLE_TAB_ICON = `${BASE}assets/svg/icon-miracle.svg?v=${SHOP_ASSET_VERSION}`
const CLOSE_TAB_ICON = `${BASE}assets/svg/icon-close.svg?v=${SHOP_ASSET_VERSION}`

// 导出供 LoadingSpace 预热（否则 ShopScreen 首帧图片加载会挂起）
export const SHOP_TAB_IMAGES = [HIRE_TAB_ICON, MIRACLE_TAB_ICON, CLOSE_TAB_ICON]

// 雇佣条兵种图标复用战斗 UI 的 icon-bow/icon-spear（与 BattleFieldSpace 的 ASSET_VERSION=3 对齐，
// 共享缓存，无需重复预热）
const HIRE_ICON_BOW = `${BASE}assets/svg/icon-bow.svg?v=3`
const HIRE_ICON_SPEAR = `${BASE}assets/svg/icon-spear.svg?v=3`

// 雇佣商品：兵种 / 名称 / 花费 / 染色 / 图标
// 注：仅含可雇佣的 bow/spear（集火机制取代了原投石车兵种）
type HireType = 'bow' | 'spear'
const HIRE_ITEMS: { type: HireType; name: string; cost: number; color: string; hoverColor: string; icon: string }[] = [
  { type: 'bow', name: 'archer', cost: 200, color: '#4a90d9', hoverColor: '#3a7bc8', icon: HIRE_ICON_BOW },
  { type: 'spear', name: 'spear', cost: 200, color: '#4a9d8f', hoverColor: '#3a8a7d', icon: HIRE_ICON_SPEAR },
]

// 操作区三按钮
const OP_BUTTONS = [
  { id: 'hire' as const, image: HIRE_TAB_ICON },
  { id: 'miracle' as const, image: MIRACLE_TAB_ICON },
  { id: 'close' as const, image: CLOSE_TAB_ICON },
]

/**
 * 商店面板（uikit 版）
 * 外层 group 面朝上（俯视正交相机），内部 uikit Container 作圆角背景，
 * 雇佣区与操作区按钮均使用 uikit-default Button，文字用 uikit Text（默认 Inter 英文），
 * 图标用 uikit Image（SVG 染色）。flexbox 排版。
 */
export default function ShopScreen({
  gold,
  onHire,
  onClose,
}: {
  gold: number
  onHire: (type: UnitType, cost: number) => void
  onClose: () => void
}) {
  const [page, setPage] = useState<'hire' | 'miracle'>('hire')

  return (
    <group position={[0, 7, 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* 背景面板 3×5m（width=300 height=500 @ pixelSize=0.01），中灰半透 */}
      <Container
        width={300}
        height={500}
        backgroundColor="#888888"
        opacity={0.85}
        borderRadius={15}
        flexDirection="column"
        alignItems="stretch"
        padding={16}
        gap={12}
      >
        {/* 雇佣区（仅 hire 页） */}
        {page === 'hire' &&
          HIRE_ITEMS.map((item) => {
            const canAfford = gold >= item.cost
            return (
              <Button
                key={item.type}
                width={270}
                height={80}
                borderRadius={10}
                paddingLeft={16}
                paddingRight={16}
                backgroundColor={item.color}
                opacity={0.85}
                flexDirection="row"
                alignItems="center"
                justifyContent="flex-start"
                hover={{ backgroundColor: item.hoverColor }}
                onClick={(e: any) => {
                  e.stopPropagation?.()
                  onHire(item.type, item.cost)
                }}
              >
                <Image src={item.icon} width={50} height={50} color="#ffffff" />
                <Text marginLeft={16} fontSize={20} color="#ffffff">
                  {item.name}
                </Text>
                <Text marginLeft="auto" fontSize={18} color={canAfford ? '#4caf50' : '#f44336'}>
                  {`${Math.min(gold, 9999)}/${item.cost}`}
                </Text>
              </Button>
            )
          })}

        {/* 操作区：雇佣页 / 神迹页 / 关闭 */}
        <Container flexDirection="row" width="100%" justifyContent="space-around" marginTop="auto">
          {OP_BUTTONS.map((btn) => {
            const isActive = btn.id === page
            const bgColor = isActive ? '#888888' : '#444444'
            const hoverBg = isActive ? '#777777' : '#333333'
            return (
              <Button
                key={btn.id}
                width={80}
                height={80}
                borderRadius={10}
                backgroundColor={bgColor}
                hover={{ backgroundColor: hoverBg }}
                onClick={(e: any) => {
                  e.stopPropagation?.()
                  if (btn.id === 'hire') setPage('hire')
                  else if (btn.id === 'miracle') setPage('miracle')
                  else onClose()
                }}
              >
                <Image src={btn.image} width={55} height={55} color={isActive ? '#666666' : '#ffffff'} />
              </Button>
            )
          })}
        </Container>
      </Container>
    </group>
  )
}
