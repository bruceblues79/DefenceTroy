import { useTexture } from '@react-three/drei'
import { Button } from '@react-three/uikit-default'
import { Text } from '@react-three/uikit'
import * as THREE from 'three'

const BASE = import.meta.env.BASE_URL

/**
 * 主菜单
 * 使用 @react-three/uikit-default 的 Button 组件。
 * uikit 组件内部仅嵌套 uikit 组件，空间定位由外层 <group> 完成。
 * 背景为一张 1:1 正方形底图（WebP），整张贴到正方形 plane 上，
 * 通过 mesh 的 scale 手动控制显示范围。
 */
export default function MainMenuSpace({ onStart }: { onStart: () => void }) {
  const bgTexture = useTexture(`${BASE}assets/textures/main-menu-bg.webp`)
  bgTexture.colorSpace = THREE.SRGBColorSpace

  return (
    <group>
      {/* 全屏底图：1:1 正方形，朝向上方/相机，scale 控制可见范围 */}
      <mesh position={[0, 0, 0]} scale={0.5} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[25, 25]} />
        <meshBasicMaterial map={bgTexture} transparent toneMapped={false} />
      </mesh>

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
