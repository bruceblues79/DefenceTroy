import { type ThreeEvent } from '@react-three/fiber'
import { useGLTF, Text } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import * as THREE from 'three'

const GLB_URL = `${import.meta.env.BASE_URL}assets/glb/main_page.glb`

// 节点名 → 颜色（直接用 GLB 中的节点名做 key）
const NODE_COLORS: Record<string, string> = {
  button_start: '#2563eb', // 开始游戏按钮：蓝
  button_back: '#dc2626', // 返回主站按钮：红
  main_page: '#ffffff', // 主页面底板：白（保留顶点色）
}

function resolveNodeName(obj: THREE.Object3D): string | null {
  let cur: THREE.Object3D | null = obj
  while (cur) {
    if (cur.name in NODE_COLORS) return cur.name
    cur = cur.parent
  }
  return null
}

function MainPageModel({ onStart }: { onStart: () => void }) {
  const { scene } = useGLTF(GLB_URL)

  const { root, startPos, backPos } = useMemo(() => {
    const root = scene.clone(true)
    root.updateWorldMatrix(true, true)
    const positions: { start: THREE.Vector3 | null; back: THREE.Vector3 | null } = {
      start: null,
      back: null,
    }
    root.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return
      const nodeName = resolveNodeName(obj)
      obj.material = new THREE.MeshBasicMaterial({
        color: nodeName ? NODE_COLORS[nodeName] : '#ffffff',
        vertexColors: true,
        toneMapped: false,
      })
      obj.userData.nodeName = nodeName
      if (nodeName === 'button_start') {
        positions.start = new THREE.Vector3().setFromMatrixPosition(obj.matrixWorld)
      } else if (nodeName === 'button_back') {
        positions.back = new THREE.Vector3().setFromMatrixPosition(obj.matrixWorld)
      }
    })
    return { root, startPos: positions.start, backPos: positions.back }
  }, [scene])

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    let cur: THREE.Object3D | null = e.object
    while (cur) {
      const name = cur.userData?.nodeName as string | undefined
      if (name) {
        if (name === 'button_back') {
          window.location.href = 'https://svalbardpost.xyz/'
        }
        if (name === 'button_start') onStart()
        return
      }
      cur = cur.parent
    }
  }

  return (
    <>
      <primitive object={root} onClick={handleClick} />
      {startPos && (
        <Text
          position={[startPos.x, startPos.y + 0.02, startPos.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          play
        </Text>
      )}
      {backPos && (
        <Text
          position={[backPos.x, backPos.y + 0.02, backPos.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          quit
        </Text>
      )}
    </>
  )
}

export default function MainMenuSpace({ onStart }: { onStart: () => void }) {
  return (
    <Suspense fallback={null}>
      <MainPageModel onStart={onStart} />
    </Suspense>
  )
}
