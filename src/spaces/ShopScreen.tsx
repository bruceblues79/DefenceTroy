import { Billboard, Text } from '@react-three/drei'
import { useState } from 'react'

export type UnitType = 'bow' | 'spear' | 'catapult'

// 雇佣商品：兵种 / 标签 / 花费 / 染色（与守军代理一致）
const HIRE_ITEMS = [
  { type: 'bow' as UnitType, label: 'archer 50g', cost: 50, color: '#4a90d9' },
  { type: 'spear' as UnitType, label: 'spearman 80g', cost: 80, color: '#4a9d8f' },
  { type: 'catapult' as UnitType, label: 'catapult 100g', cost: 100, color: '#6b4226' },
]

// 雇佣区 3 行 Y 中心（Y∈[-1.45,2.5]，均分 3 行，位于面板上半）
const HIRE_ROW_Y = [1.842, 0.525, -0.792]
// 操作区 3 按钮 X 中心（宽 3 横分，按钮 0.8×0.8，位于面板下半）
const OP_BUTTON_X = [-0.9, 0, 0.9]
const OP_BUTTONS = ['H', 'G', 'C'] as const

/**
 * 商店面板
 * Billboard 位于 [0,-1.2,7]，因低于地面需 depthTest=false 保证可见
 * 雇佣区(Y∈[-2.5,1.45]) 3 行兵种按钮；操作区(Y∈[1.45,2.5]) H/G/C 三按钮
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
    <Billboard position={[0, 7, 0]}>
      {/* 金币显示（面板上方） */}
      <mesh position={[0, 2.85, 0]} renderOrder={3}>
        <planeGeometry args={[1.6, 0.4]} />
        <meshBasicMaterial color="#333333" depthTest={false} />
      </mesh>
      <Text
        position={[0, 2.85, 0.01]}
        fontSize={0.22}
        color="#ffd700"
        anchorX="center"
        anchorY="middle"
        renderOrder={4}
        material-depthTest={false}
      >
        {`G : ${gold}`}
      </Text>

      {/* 面板背景 */}
      <mesh position={[0, 0, 0]} renderOrder={1}>
        <planeGeometry args={[3, 5]} />
        <meshBasicMaterial color="#888888" depthTest={false} />
      </mesh>

      {/* 雇佣区（仅 hire 页） */}
      {page === 'hire' &&
        HIRE_ITEMS.map((item, i) => (
          <mesh
            key={item.type}
            position={[0, HIRE_ROW_Y[i], 0.01]}
            renderOrder={2}
            onClick={(e) => {
              e.stopPropagation()
              onHire(item.type, item.cost)
            }}
          >
            <planeGeometry args={[2.8, 1.2]} />
            <meshBasicMaterial color={item.color} depthTest={false} />
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.3}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              renderOrder={3}
              material-depthTest={false}
            >
              {item.label}
            </Text>
          </mesh>
        ))}

      {/* 操作区：H(雇佣页) / G(神迹页) / C(关闭) */}
      {OP_BUTTONS.map((label, i) => (
        <mesh
          key={label}
          position={[OP_BUTTON_X[i], -1.975, 0.01]}
          renderOrder={2}
          onClick={(e) => {
            e.stopPropagation()
            if (label === 'H') setPage('hire')
            else if (label === 'G') setPage('miracle')
            else onClose()
          }}
        >
          <planeGeometry args={[0.8, 0.8]} />
          <meshBasicMaterial color="#555555" depthTest={false} />
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.35}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            renderOrder={3}
            material-depthTest={false}
          >
            {label}
          </Text>
        </mesh>
      ))}
    </Billboard>
  )
}
