import { Billboard, Text } from '@react-three/drei'
import RoundShapePlane from '../components/RoundShapePlane'
import RoundedShapeButton from '../components/RoundedShapeButton'

type GameResult = 'victory' | 'defeat'

/**
 * 结算菜单
 * - 胜利：只一个蓝染按钮（返回主菜单）
 * - 失败：重新开始（黄）+ 返回主菜单（红）
 */
export default function SettlementMenu({
  result,
  onRestart,
  onExitToMenu,
}: {
  result: GameResult
  onRestart: () => void
  onExitToMenu: () => void
}) {
  if (result === 'victory') {
    return (
      <Billboard position={[0, 3, 0]}>
        <RoundShapePlane width={3} height={3} cornerRadius={0.15} color="#666666" position={[0, 0.01, 0]} />
        <group position={[0, 0, 0.02]}>
          <RoundedShapeButton
            width={2.5}
            height={1}
            cornerRadius={0.1}
            color="#4a90d9"
            onClick={(e) => {
              e.stopPropagation()
              onExitToMenu()
            }}
          />
          <Text position={[0, 0, 0.01]} fontSize={0.35} color="#ffffff" anchorX="center" anchorY="middle">win</Text>
        </group>
      </Billboard>
    )
  }

  // defeat
  return (
    <Billboard position={[0, 3, 0]}>
      <RoundShapePlane width={3} height={3} cornerRadius={0.15} color="#666666" position={[0, 0.01, 0]} />
      <group position={[0, 0.625, 0.02]}>
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
        <Text position={[0, 0, 0.01]} fontSize={0.35} color="#ffffff" anchorX="center" anchorY="middle">retry</Text>
      </group>
      <group position={[0, -0.625, 0.02]}>
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
