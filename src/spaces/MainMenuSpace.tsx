import { Canvas } from '@react-three/fiber'

export default function MainMenuSpace() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ background: '#888888' }}
    />
  )
}
