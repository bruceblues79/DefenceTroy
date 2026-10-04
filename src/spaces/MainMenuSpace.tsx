import { Root, Text } from '@react-three/uikit'

/**
 * 主菜单
 * 使用 @react-three/uikit 实现两个按钮（quit / play）。
 * uikit 组件内部仅嵌套 uikit 组件，空间定位由外层 <group> 完成。
 * 无背景 panel，依赖场景背景色（中灰 #888888）。
 * 两按钮组中心位于 [0,2,2]，quit 在上 play 在下，平铺朝上适配顶视相机。
 */
export default function MainMenuSpace({ onStart }: { onStart: () => void }) {
  return (
    <group>
      {/* quit 按钮（红） — 返回主站，上方 */}
      <group position={[0, 2, 2.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <Root
          sizeX={2.5}
          sizeY={1}
          backgroundColor="#dc2626"
          borderRadius={0.1}
          alignItems="center"
          justifyContent="center"
          onClick={(e) => {
            e.stopPropagation()
            window.location.href = 'https://svalbardpost.xyz/'
          }}
        >
          <Text color="#ffffff" fontSize={15}>quit</Text>
        </Root>
      </group>

      {/* play 按钮（蓝），下方 */}
      <group position={[0, 2, 1.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <Root
          sizeX={2.5}
          sizeY={1}
          backgroundColor="#2563eb"
          borderRadius={0.1}
          alignItems="center"
          justifyContent="center"
          onClick={(e) => {
            e.stopPropagation()
            onStart()
          }}
        >
          <Text color="#ffffff" fontSize={15}>play</Text>
        </Root>
      </group>
    </group>
  )
}
