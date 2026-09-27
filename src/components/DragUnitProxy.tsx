import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

interface DragUnitProxyProps {
  /** 与拖拽兵种一致的染色；提供 image 时作为贴图染色 */
  color: string
  /** 可选图片 URL；提供时渲染被 color 染色的贴图平面，否则渲染纯色半透明平面 */
  image?: string
}

/**
 * 图片槽位子组件：避免 useTexture 条件调用
 * 尺寸 0.9×0.9，沿 y=6 平面跟随指针。
 */
function DragImage({ url, color }: { url: string; color: string }) {
  const tex = useTexture(url)
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
      <planeGeometry args={[0.9, 0.9]} />
      <meshBasicMaterial map={tex} color={color} transparent opacity={0.75} depthTest={false} />
    </mesh>
  )
}

/**
 * 拖拽示意物：0.9×0.9 半透明平面，水平朝上，y=6 跟随 pointer 在 XZ 平面投影
 * 仅在拖拽期间由 BattleFieldSpace 渲染；释放时随组件卸载
 * raycast={() => null} 不参与命中检测，避免遮挡其他物体的 pointer 事件
 */
export default function DragUnitProxy({ color, image }: DragUnitProxyProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { raycaster, pointer, camera } = useThree()
  // y=6 水平面（normal 朝 +y，constant = -6）
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -6), [])

  useFrame(() => {
    if (!groupRef.current) return
    raycaster.setFromCamera(pointer, camera)
    const target = new THREE.Vector3()
    if (raycaster.ray.intersectPlane(plane, target)) {
      groupRef.current.position.set(target.x, 6, target.z)
    }
  })

  return (
    <group ref={groupRef} position={[0, 6, 0]}>
      {image ? (
        <DragImage url={image} color={color} />
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
          <planeGeometry args={[0.9, 0.9]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} depthTest={false} />
        </mesh>
      )}
    </group>
  )
}
