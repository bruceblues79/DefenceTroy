import { Billboard } from '@react-three/drei'
import { type ThreeEvent } from '@react-three/fiber'
import GameMenu from './GameMenu'
import BattleSystems from '../components/BattleSystems'
import UnitRenderer from '../components/UnitRenderer'

const BUTTON_NAMES = ['btn_bow', 'btn_spear', 'btn_throw', 'btn_shop', 'btn_menu'] as const
const BUTTON_X = [-1.95, -0.975, 0, 0.975, 1.95]
const BUTTON_COLORS = ['#888888', '#888888', '#888888', '#888888', '#cc2222']

export default function BattleFieldSpace({
  paused,
  onPause,
  onResume,
  onRestart,
  onExitToMenu,
}: {
  paused: boolean
  onPause: () => void
  onResume: () => void
  onRestart: () => void
  onExitToMenu: () => void
}) {
  return (
    <group>
      {/* 战斗系统驱动（无渲染） */}
      <BattleSystems paused={paused} />

      {/* ground: plane 5×9, beach sand */}
      <mesh name="ground" position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 9]} />
        <meshStandardMaterial color="#d4c4a0" />
      </mesh>

      {/* ECS 驱动的战场单位（城墙、敌人、守军、抛射物） */}
      <UnitRenderer />

      {/* five buttons: 0.84 square planes, billboard to face camera */}
      {BUTTON_NAMES.map((name, i) => (
        <Billboard key={name} position={[BUTTON_X[i], 2.0, 4.0]}>
          <mesh
            name={name}
            onClick={
              name === 'btn_menu' && !paused
                ? (e: ThreeEvent<MouseEvent>) => {
                    e.stopPropagation()
                    onPause()
                  }
                : undefined
            }
          >
            <planeGeometry args={[0.8, 0.8]} />
            <meshBasicMaterial color={BUTTON_COLORS[i]} />
          </mesh>
        </Billboard>
      ))}

      {paused && (
        <GameMenu onResume={onResume} onRestart={onRestart} onExitToMenu={onExitToMenu} />
      )}
    </group>
  )
}
