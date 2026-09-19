import { Billboard, Text } from '@react-three/drei'
import RoundShapePlane from '../components/RoundShapePlane'
import RoundedShapeButton from '../components/RoundedShapeButton'

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
      <RoundShapePlane width={3} height={4} cornerRadius={0.15} color="#888888" position={[0, 0.01, 0]} />
      <group position={[0, 1.25, 0.02]}>
        <RoundedShapeButton
          width={2.5}
          height={1}
          cornerRadius={0.1}
          color="#2563eb"
          onClick={(e) => {
            e.stopPropagation()
            onResume()
          }}
        />
        <Text position={[0, 0, 0.01]} fontSize={0.35} color="#ffffff" anchorX="center" anchorY="middle">resume</Text>
      </group>
      <group position={[0, 0, 0.02]}>
        <RoundedShapeButton
          width={2.5}
          height={1}
          cornerRadius={0.1}
          color="#eab308"
          onClick={(e) => {
            e.stopPropagation()
            onRestart()
          }}
        />
        <Text position={[0, 0, 0.01]} fontSize={0.35} color="#ffffff" anchorX="center" anchorY="middle">restart</Text>
      </group>
      <group position={[0, -1.25, 0.02]}>
        <RoundedShapeButton
          width={2.5}
          height={1}
          cornerRadius={0.1}
          color="#dc2626"
          onClick={(e) => {
            e.stopPropagation()
            onExitToMenu()
          }}
        />
        <Text position={[0, 0, 0.01]} fontSize={0.35} color="#ffffff" anchorX="center" anchorY="middle">quit</Text>
      </group>
    </Billboard>
  )
}
