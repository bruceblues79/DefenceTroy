import { Button } from '@react-three/uikit-default'
import { Text } from '@react-three/uikit'

/**
 * 主菜单按钮区。
 * 底图由 App.tsx 的 MenuBackground 统一渲染（menu/loading 共用），这里只放按钮。
 * uikit 组件内部仅嵌套 uikit 组件，空间定位由外层 <group> 完成。
 */
export default function MainMenuSpace({ onStart }: { onStart: () => void }) {
  return (
    <group>
      {/* quit 按钮（红） — 返回主站，上方 */}
      <group position={[0, 2, 2.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <Button
          width={250}
          height={100}
          backgroundColor="#dc2626"
          color="#ffffff"
          fontSize={30}
          borderRadius={10}
          hover={{ backgroundColor: '#b91c1c' }}
          onClick={(e: any) => {
            e.stopPropagation?.()
            window.location.href = 'https://svalbardpost.xyz/'
          }}
        >
          <Text color="#ffffff" fontSize={30}>quit</Text>
        </Button>
      </group>

      {/* play 按钮（蓝），下方 */}
      <group position={[0, 2, 1.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <Button
          width={250}
          height={100}
          backgroundColor="#2563eb"
          color="#ffffff"
          fontSize={30}
          borderRadius={10}
          hover={{ backgroundColor: '#1d4ed8' }}
          onClick={(e: any) => {
            e.stopPropagation?.()
            onStart()
          }}
        >
          <Text color="#ffffff" fontSize={30}>play</Text>
        </Button>
      </group>
    </group>
  )
}
