import { Container, Text } from '@react-three/uikit'
import { Button } from '@react-three/uikit-default'

type GameResult = 'victory' | 'defeat'

/**
 * 结算菜单（uikit 版）
 * 外层 group 平放面朝上（俯视正交相机），内部 uikit Container 作圆角背景。
 * - 胜利：单个 win 按钮（蓝）返回主菜单
 * - 失败：retry（黄）+ quit（红）两按钮
 * 文字使用 uikit 默认 Inter 字体（英文）。
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
  return (
    <group position={[0, 3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <Container
        width={300}
        height={300}
        backgroundColor="#666666"
        opacity={0.85}
        borderRadius={15}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        padding={16}
        gap={12}
      >
        {result === 'victory' ? (
          <Button
            width={250}
            height={100}
            backgroundColor="#4a90d9"
            color="#ffffff"
            fontSize={30}
            borderRadius={10}
            hover={{ backgroundColor: '#3a7bc8' }}
            onClick={(e: any) => {
              e.stopPropagation?.()
              onExitToMenu()
            }}
          >
            <Text color="#ffffff" fontSize={30}>win</Text>
          </Button>
        ) : (
          <>
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
              <Text color="#ffffff" fontSize={30}>retry</Text>
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
          </>
        )}
      </Container>
    </group>
  )
}
