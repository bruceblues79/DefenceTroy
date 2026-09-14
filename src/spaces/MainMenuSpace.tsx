import { Canvas } from '@react-three/fiber'

// 主菜单页面：暂时只渲染灰色背景，UI 待后续用 plane 自制按钮补齐
export default function MainMenuSpace() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
      <color attach="background" args={['#888888']} />
    </Canvas>
  )
}
