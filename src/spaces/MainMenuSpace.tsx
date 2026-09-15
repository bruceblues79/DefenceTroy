import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import * as THREE from 'three'

const GLB_URL = `${import.meta.env.BASE_URL}assets/glb/main_page.glb`

const COLORS = {
  start: '#2563eb', // 开始游戏按钮：蓝
  back: '#dc2626', // 返回主站按钮：红
  page: '#6b7280', // 主页面底板：中灰
} as const

type ButtonType = 'start' | 'back' | 'page'

function resolveButtonType(obj: THREE.Object3D): ButtonType | null {
  let cur: THREE.Object3D | null = obj
  while (cur) {
    if (cur.name === 'button_start') return 'start'
    if (cur.name === 'button_back') return 'back'
    if (cur.name === 'main_page') return 'page'
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
    <Canvas>
      <color attach="background" args={['#000000']} />
      <PerspectiveCamera makeDefault position={[0, 9, 0]} fov={50} />
      <OrbitControls
        target={[0, 0, 0]}
        enablePan={false}
        minDistance={7}
        maxDistance={9}
        minAzimuthAngle={0}
        maxAzimuthAngle={0}
        minPolarAngle={0.001}
        maxPolarAngle={THREE.MathUtils.degToRad(30)}
      />
      <Suspense fallback={null}>
        <MainPageModel />
      </Suspense>
    </Canvas>
  )
}
