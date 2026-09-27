import { Billboard, Text, useTexture } from '@react-three/drei'
import { useState } from 'react'
import RoundShapePlane from '../components/RoundShapePlane'
import RoundedShapeButton from '../components/RoundedShapeButton'

export type UnitType = 'bow' | 'spear'

const BASE = import.meta.env.BASE_URL

// 商店专属图标缓存破坏版本号（首次部署 = 1，未来改图标时递增）
const SHOP_ASSET_VERSION = 1
const HIRE_TAB_ICON = `${BASE}assets/svg/icon-hire.svg?v=${SHOP_ASSET_VERSION}`
const MIRACLE_TAB_ICON = `${BASE}assets/svg/icon-miracle.svg?v=${SHOP_ASSET_VERSION}`
const CLOSE_TAB_ICON = `${BASE}assets/svg/icon-close.svg?v=${SHOP_ASSET_VERSION}`

// 导出供 LoadingSpace 预热（否则 ShopScreen 首帧 useTexture 会挂起）
export const SHOP_TAB_IMAGES = [HIRE_TAB_ICON, MIRACLE_TAB_ICON, CLOSE_TAB_ICON]

// 雇佣条兵种图标复用战斗 UI 的 icon-bow/icon-spear（与 BattleFieldSpace 的 ASSET_VERSION=3 对齐，
// 共享缓存，无需重复预热）
const HIRE_ICON_BOW = `${BASE}assets/svg/icon-bow.svg?v=3`
const HIRE_ICON_SPEAR = `${BASE}assets/svg/icon-spear.svg?v=3`

// 雇佣商品：兵种 / 名称 / 花费 / 染色（与战斗 UI SVG 染色一致） / 图标
// 注：仅含可雇佣的 bow/spear（集火机制取代了原投石车兵种）
type HireType = 'bow' | 'spear'
const HIRE_ITEMS: { type: HireType; name: string; cost: number; color: string; icon: string }[] = [
  { type: 'bow', name: 'archer', cost: 200, color: '#4a90d9', icon: HIRE_ICON_BOW },
  { type: 'spear', name: 'spear', cost: 200, color: '#4a9d8f', icon: HIRE_ICON_SPEAR },
]

// 雇佣条布局：bar 宽 3.0（顶满面板），高 0.8，圆角 0.1
// 雇佣区 2 行 Y 中心（顶 padding 0.3，行间距 0.3）
const HIRE_ROW_Y = [1.8, 0.7]
// 单条内部 localX：图标（左）/ 名称（中）/ 费用（右）
// bar localX ∈ [-1.5, 1.5]，图标 0.5×0.5 居左，名称偏左，费用靠右
const ICON_SIZE = 0.5
const ICON_LOCAL_X = -1.0
// 名称首字母对齐：两排图标右端都在 -0.75，名称从 -0.6 起左对齐（0.15 gap）
const NAME_LOCAL_X = -0.6
const COST_LOCAL_X = 1.05

// 操作区 3 按钮 X 中心（宽 3 横分，按钮 0.8×0.8，位于面板下半）
const OP_BUTTON_X = [-0.9, 0, 0.9]
const OP_BUTTONS = [
  { id: 'hire' as const, image: HIRE_TAB_ICON },
  { id: 'miracle' as const, image: MIRACLE_TAB_ICON },
  { id: 'close' as const, image: CLOSE_TAB_ICON },
]

// 面板整体沿世界 +z 的偏移量（正交相机下等价于屏幕上往下挪，1 单位 = 80px）
const SHOP_Z = 1.0

/**
 * 商店面板
 * Billboard 位于 [0,7,SHOP_Z]：悬在相机与战场之间，半透明 depthTest=false 保证压在最上层
 * 雇佣区 2 行弓手/矛手；操作区 3 颗图标按钮（雇佣/神迹/关闭）
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

  // 预加载雇佣条兵种图标（共享战斗 UI 缓存，无 suspense）
  const [bowTex, spearTex] = useTexture([HIRE_ICON_BOW, HIRE_ICON_SPEAR])
  const ICON_TEX = { bow: bowTex, spear: spearTex }

  return (
    <Billboard position={[0, 7, SHOP_Z]}>
      {/* 面板背景（半透明） */}
      <RoundShapePlane
        width={3}
        height={5}
        cornerRadius={0.15}
        color="#888888"
        opacity={0.85}
        depthTest={false}
        renderOrder={1}
      />

      {/* 雇佣区（仅 hire 页） */}
      {page === 'hire' &&
        HIRE_ITEMS.map((item, i) => {
          const canAfford = gold >= item.cost
          return (
            <group key={item.type} position={[0, HIRE_ROW_Y[i], 0.01]}>
              <RoundedShapeButton
                width={3.0}
                height={0.8}
                cornerRadius={0.1}
                color={item.color}
                opacity={0.85}
                depthTest={false}
                renderOrder={2}
                onClick={(e) => {
                  e.stopPropagation()
                  onHire(item.type, item.cost)
                }}
              />
              {/* 兵种图标（左对齐，0.5×0.5，白染） */}
              <mesh position={[ICON_LOCAL_X, 0, 0.005]} renderOrder={3}>
                <planeGeometry args={[ICON_SIZE, ICON_SIZE]} />
                <meshBasicMaterial
                  map={ICON_TEX[item.type]}
                  color="#ffffff"
                  transparent
                  depthWrite={false}
                  depthTest={false}
                  toneMapped={false}
                />
              </mesh>
              {/* 兵种名称（左对齐，首字母对齐） */}
              <Text
                position={[NAME_LOCAL_X, 0, 0.01]}
                fontSize={0.2}
                color="#ffffff"
                anchorX="left"
                anchorY="middle"
                renderOrder={3}
                material-depthTest={false}
              >
                {item.name}
              </Text>
              {/* 费用/金币（右段，小字号，够金币绿色，不够红色） */}
              <Text
                position={[COST_LOCAL_X, 0, 0.01]}
                fontSize={0.18}
                color={canAfford ? '#4caf50' : '#f44336'}
                anchorX="center"
                anchorY="middle"
                renderOrder={3}
                material-depthTest={false}
              >
                {`${Math.min(gold, 9999)}/${item.cost}`}
              </Text>
            </group>
          )
        })}

      {/* 操作区：雇佣页 / 神迹页 / 关闭（图标化，无文字，白染图标；当前页按钮高亮） */}
      {OP_BUTTONS.map((btn, i) => {
        const isActive = btn.id === page
        return (
          <RoundedShapeButton
            key={btn.id}
            width={0.8}
            height={0.8}
            cornerRadius={0.1}
            color={isActive ? '#888888' : '#444444'}
            depthTest={false}
            renderOrder={2}
            position={[OP_BUTTON_X[i], -1.975, 0.01]}
            image={btn.image}
            imageScale={0.55}
            imageColor={isActive ? '#666666' : '#ffffff'}
            onClick={(e) => {
              e.stopPropagation()
              if (btn.id === 'hire') setPage('hire')
              else if (btn.id === 'miracle') setPage('miracle')
              else onClose()
            }}
          />
        )
      })}
    </Billboard>
  )
}
