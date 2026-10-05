import { Container, Text } from '@react-three/uikit'
import { Button } from '@react-three/uikit-default'

/**
 * 游戏内暂停菜单（uikit 版）
 * 外层 group 平放面朝上（俯视正交相机），内部 uikit Container 作圆角背景，
 * 三个按钮均使用 uikit-default Button，文字用 uikit Text（默认 Inter 英文）。
 */
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
    <group position={[0, 3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <Container
        width={300}
        height={400}
        backgroundColor="#888888"
        opacity={0.85}
        borderRadius={15}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        padding={16}
        gap={12}
      >
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
            onResume()
          }}
        >
          <Text color="#ffffff" fontSize={30}>resume</Text>
        </Button>

        <Button
          width={250}
          height={100}
          backgroundColor="#eab308"
          color="#ffffff"
          fontSize={30}
          borderRadius={10}
          hover={{ backgroundColor: '#ca8a04' }}
          onClick={(e: any) => {
            e.stopPropagation?.()
            onRestart()
          }}
        >
          <Text color="#ffffff" fontSize={30}>restart</Text>
        </Button>

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
            onExitToMenu()
          }}
        >
          <Text color="#ffffff" fontSize={30}>quit</Text>
        </Button>
      </Container>
    </group>
  )
}
