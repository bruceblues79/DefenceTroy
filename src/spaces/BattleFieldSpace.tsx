import { Billboard } from '@react-three/drei'
import { type ThreeEvent } from '@react-three/fiber'
import GameMenu from './GameMenu'

const BUTTON_NAMES = ['btn_bow', 'btn_spear', 'btn_throw', 'btn_shop', 'btn_menu'] as const
const BUTTON_X = [-2.25, -1.125, 0, 1.125, 2.25]
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
      {/* ground: plane 5×9, beach sand */}
      <mesh name="ground" position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 9]} />
        <meshStandardMaterial color="#d4c4a0" />
      </mesh>

      {/* wall: box 4.5×4×0.84, earth yellow */}
      <mesh name="wall" position={[0, 0, 2.75]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 4, 0.84]} />
        <meshStandardMaterial color="#a68b5b" />
      </mesh>

      {/* five buttons: 0.84 square planes, billboard to face camera */}
      {BUTTON_NAMES.map((name, i) => (
        <Billboard key={name} position={[BUTTON_X[i], 2.0, 3.75]}>
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

      {/* soldier proxy: box 0.5×1×0.5, placed on wall center */}
      <mesh name="solder_proxy" position={[0, 2.5, 2.75]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial color="#cd7f32" />
      </mesh>

      {paused && (
        <GameMenu onResume={onResume} onRestart={onRestart} onExitToMenu={onExitToMenu} />
      )}
    </group>
  )
}
