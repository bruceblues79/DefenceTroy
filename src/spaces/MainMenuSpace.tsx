import { useTexture } from '@react-three/drei'
import { Button } from '@react-three/uikit-default'
import { Image, Text } from '@react-three/uikit'
import * as THREE from 'three'

const BASE = import.meta.env.BASE_URL
const BG_ASSET_VERSION = 1
/** 主菜单 / loading 共用底图（1:1 正方形 WebP） */
export const BG_URL = `${BASE}assets/textures/main-menu-bg.webp?v=${BG_ASSET_VERSION}`

/**
 * 主菜单
 * 使用 @react-three/uikit-default 的 Button 组件。
 * 底图用 uikit <Image> 渲染（比裸 plane+material 更规则），
 * 外层 group 的 scale 手动控制底图可见范围。
 * uikit 组件内部仅嵌套 uikit 组件，空间定位由外层 <group> 完成。
 */
export default function MainMenuSpace({ onStart }: { onStart: () => void }) {
  const bgTexture = useTexture(BG_URL)
  bgTexture.colorSpace = THREE.SRGBColorSpace

  return (
    <group>
      {/* 底图：uikit Image，1:1 正方形，外层 scale 控制可见范围 */}
      <group position={[0, 0, 0]} scale={0.5} rotation={[-Math.PI / 2, 0, 0]}>
        <Image src={bgTexture} sizeX={2500} sizeY={2500} />
      </group>

      {/* quit 按钮（红） — 返回主站，上方 */}
      <group position={[0, 2, 2.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <Button
          width={250}
          height={100}
          backgroundColor="#dc2626"
          color="#ffffff"
          fontSize={30}
          borderRadius={10}
          hover={{ backgroundColor: '#b91c1c' }}
          onClick={(e: any) => {
            e.stopPropagation?.()
            window.location.href = 'https://svalbardpost.xyz/'
          }}
        >
          <Text color="#ffffff" fontSize={30}>quit</Text>
        </Button>
      </group>

      {/* play 按钮（蓝），下方 */}
      <group position={[0, 2, 1.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <Button
          width={250}
          height={100}
          backgroundColor="#2563eb"
          color="#ffffff"
          fontSize={30}
          borderRadius={10}
          hover={{ backgroundColor: '#1d4ed8' }}
          onClick={(e: any) => {
            e.stopPropagation?.()
            onStart()
          }}
        >
          <Text color="#ffffff" fontSize={30}>play</Text>
        </Button>
      </group>
    </group>
  )
}
