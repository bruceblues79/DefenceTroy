import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

interface DragUnitProxyProps {
  /** 与拖拽兵种一致的染色 */
  color: string
}

/**
 * 拖拽示意物：0.3×0.3 半透明平面，水平朝上，y=6 跟随 pointer 在 XZ 平面投影
 * 仅在拖拽期间由 BattleFieldSpace 渲染；释放时随组件卸载
 * raycast={() => null} 不参与命中检测，避免遮挡其他物体的 pointer 事件
 */
export default function DragUnitProxy({ color }: DragUnitProxyProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { raycaster, pointer, camera } = useThree()
  // y=6 水平面（normal 朝 +y，constant = -6）
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -6), [])

  useFrame(() => {
    if (!meshRef.current) return
    raycaster.setFromCamera(pointer, camera)
    const target = new THREE.Vector3()
    if (raycaster.ray.intersectPlane(plane, target)) {
      meshRef.current.position.set(target.x, 6, target.z)
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={[0, 6, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      raycast={() => null}
    >
      <planeGeometry args={[0.9, 0.9]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} depthTest={false} />
    </mesh>
  )
}
