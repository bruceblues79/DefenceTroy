import { type ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import * as THREE from 'three'

const GLB_URL = `${import.meta.env.BASE_URL}assets/glb/main_page.glb`

const COLORS = {
  start: '#2563eb', // 开始游戏按钮：蓝
  back: '#dc2626', // 返回主站按钮：红
} as const

type ButtonType = 'start' | 'back'

function resolveButtonType(obj: THREE.Object3D): ButtonType | null {
  let cur: THREE.Object3D | null = obj
  while (cur) {
    if (cur.name === 'button_start') return 'start'
    if (cur.name === 'button_back') return 'back'
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
      const type = resolveButtonType(obj)
      obj.material = new THREE.MeshBasicMaterial({
        color: type ? COLORS[type] : '#ffffff',
        toneMapped: false,
      })
      obj.userData.buttonType = type
    })
    return root
  }, [scene])

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    let cur: THREE.Object3D | null = e.object
    while (cur) {
      const type = cur.userData?.buttonType as ButtonType | undefined
      if (type) {
        if (type === 'back') {
          window.location.href = 'https://svalbardpost.xyz/'
        }
        // 'start' 为占位按钮，无后续内容
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
