import { type ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
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

function MainPageModel() {
  const { scene } = useGLTF(GLB_URL)

  const cloned = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return
      const nodeName = resolveNodeName(obj)
      obj.material = new THREE.MeshBasicMaterial({
        color: nodeName ? NODE_COLORS[nodeName] : '#ffffff',
        vertexColors: true,
        toneMapped: false,
      })
      obj.userData.nodeName = nodeName
    })
    return root
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
        // 'button_start' 为占位按钮，无后续内容
        return
      }
      cur = cur.parent
    }
  }

  return <primitive object={cloned} onClick={handleClick} />
}

export default function MainMenuSpace() {
  return (
    <Suspense fallback={null}>
      <MainPageModel />
    </Suspense>
  )
}
