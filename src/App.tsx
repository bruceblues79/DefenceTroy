import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { WorldProvider } from 'koota/react'
import { world } from './core/world'
import MainMenuSpace from './spaces/MainMenuSpace'
import * as THREE from 'three'

export default function App() {
  return (
    <WorldProvider world={world}>
      <Canvas dpr={[1, 2]}>
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
        <directionalLight position={[2, 9, 0]} />
        <MainMenuSpace />
      </Canvas>
    </WorldProvider>
  )
}
