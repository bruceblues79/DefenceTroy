import { Text } from '@react-three/drei'
import RoundedShapeButton from '../components/RoundedShapeButton'

/**
 * 主菜单
 * 不再使用 GLB 模型,改为程序化圆角按钮。
 * 无背景 panel,依赖场景背景色(中灰 #888888)。
 * 两按钮组中心位于 [0,2,2],quit 在上 play 在下,平铺朝上适配顶视相机。
 */
export default function MainMenuSpace({ onStart }: { onStart: () => void }) {
  return (
    <group>
      {/* quit 按钮（红） — 返回主站,上方 */}
      <group position={[0, 2, 2.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <RoundedShapeButton
          name="button_back"
          width={2.5}
          height={1}
          cornerRadius={0.1}
          color="#dc2626"
          onClick={(e) => {
            e.stopPropagation()
            window.location.href = 'https://svalbardpost.xyz/'
          }}
        />
        <Text position={[0, 0, 0.01]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle">quit</Text>
      </group>

      {/* play 按钮（蓝）,下方 */}
      <group position={[0, 2, 1.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <RoundedShapeButton
          name="button_start"
          width={2.5}
          height={1}
          cornerRadius={0.1}
          color="#2563eb"
          onClick={(e) => {
            e.stopPropagation()
            onStart()
          }}
        />
        <Text position={[0, 0, 0.01]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle">play</Text>
      </group>
    </group>
  )
}
