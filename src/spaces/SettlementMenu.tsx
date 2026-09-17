import { Billboard } from '@react-three/drei'

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
        <mesh position={[0, 0.01, 0]}>
          <planeGeometry args={[3, 3]} />
          <meshBasicMaterial color="#666666" />
        </mesh>
        <mesh
          position={[0, 0, 0.02]}
          onClick={(e) => {
            e.stopPropagation()
            onExitToMenu()
          }}
        >
          <planeGeometry args={[2.5, 1]} />
          <meshBasicMaterial color="#4a90d9" />
        </mesh>
      </Billboard>
    )
  }

  // defeat
  return (
    <Billboard position={[0, 3, 0]}>
      <mesh position={[0, 0.01, 0]}>
        <planeGeometry args={[3, 3]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      <mesh position={[0, 0.625, 0.02]} onClick={(e) => { e.stopPropagation(); onRestart() }}>
        <planeGeometry args={[2.5, 1]} />
        <meshBasicMaterial color="#eab308" />
      </mesh>
      <mesh position={[0, -0.625, 0.02]} onClick={(e) => { e.stopPropagation(); onExitToMenu() }}>
        <planeGeometry args={[2.5, 1]} />
        <meshBasicMaterial color="#dc2626" />
      </mesh>
    </Billboard>
  )
}
