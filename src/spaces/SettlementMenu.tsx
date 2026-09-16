import { Billboard } from '@react-three/drei'

/**
 * 结算菜单
 * 城墙被毁后弹出，只有重新开始和退出主菜单
 */
export default function SettlementMenu({
  onRestart,
  onExitToMenu,
}: {
  onRestart: () => void
  onExitToMenu: () => void
}) {
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
