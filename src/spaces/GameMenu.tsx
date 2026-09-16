import { Billboard } from '@react-three/drei'

export default function GameMenu({
  onResume,
  onRestart,
  onExitToMenu,
}: {
  onResume: () => void
  onRestart: () => void
  onExitToMenu: () => void
}) {
  return (
    <Billboard position={[0, 3, 0]}>
      <mesh position={[0, 0.01, 0]}>
        <planeGeometry args={[3, 4]} />
        <meshBasicMaterial color="#888888" />
      </mesh>
      <mesh position={[0, 1.25, 0.02]} onClick={(e) => { e.stopPropagation(); onResume() }}>
        <planeGeometry args={[2.5, 1]} />
        <meshBasicMaterial color="#2563eb" />
      </mesh>
      <mesh position={[0, 0, 0.02]} onClick={(e) => { e.stopPropagation(); onRestart() }}>
        <planeGeometry args={[2.5, 1]} />
        <meshBasicMaterial color="#eab308" />
      </mesh>
      <mesh position={[0, -1.25, 0.02]} onClick={(e) => { e.stopPropagation(); onExitToMenu() }}>
        <planeGeometry args={[2.5, 1]} />
        <meshBasicMaterial color="#dc2626" />
      </mesh>
    </Billboard>
  )
}
