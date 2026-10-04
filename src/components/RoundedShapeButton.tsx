import { type ThreeEvent } from '@react-three/fiber'
import { Text, useTexture } from '@react-three/drei'
import RoundShapePlane from './RoundShapePlane'
import { UI_FONT } from '../core/font'
import { playClick, unlockAudio } from '../core/audio'

interface RoundedShapeButtonProps {
  // ── 几何/外观(透传给 RoundShapePlane) ──
  width?: number
  height?: number
  cornerRadius?: number
  cornerSegments?: number
  color?: string
  opacity?: number
  depthTest?: boolean
  renderOrder?: number
  toneMapped?: boolean
  position?: [number, number, number]
  rotation?: [number, number, number]
  name?: string
  // ── 交互 ──
  onClick?: (e: ThreeEvent<MouseEvent>) => void
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void
  onPointerUp?: (e: ThreeEvent<PointerEvent>) => void
  /** 是否播放点击音效,默认 true。拖拽类按钮(兵营/集火)应设为 false */
  soundEnabled?: boolean
  // ── 可选图片槽位 ──
  /** 图片 URL;提供时在 localZ +0.005 渲染一个透明图片平面 */
  image?: string
  /** 图片相对按钮尺寸的缩放,默认 1(铺满 width/height) */
  imageScale?: number
  /** 图片是否透明,默认 true */
  imageTransparent?: boolean
  /** 图片染色(与 meshBasicMaterial.color 相乘),默认白色不染色 */
  imageColor?: string
  // ── 可选文字标签 ──
  /** 按钮文字;提供时在按钮表面 localZ +0.01 渲染 */
  label?: string
  labelColor?: string
  labelFontSize?: number
}

/**
 * 图片槽位子组件
 * 独立组件以避免 useTexture 的条件 hook 调用。
 * 尺寸 = 按钮 width/height × imageScale。
 */
function ButtonImage({
  url,
  transparent,
  color,
  width,
  height,
  renderOrder,
}: {
  url: string
  transparent?: boolean
  color?: string
  width: number
  height: number
  renderOrder?: number
}) {
  const tex = useTexture(url)
  return (
    <mesh position={[0, 0, 0.005]} renderOrder={renderOrder}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={tex} color={color ?? '#ffffff'} transparent={transparent ?? true} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

/**
 * 圆角按钮
 * 基于 RoundShapePlane,直接复用其 mesh,raycast 命中区为圆角形状本身。
 * 可选图片槽位位于 localZ +0.005。
 * 不带 Text —— Text 由调用方作为兄弟节点添加(遵循项目既有约定)。
 */
export default function RoundedShapeButton({
  width = 0.5,
  height = 0.5,
  onClick,
  onPointerDown,
  onPointerUp,
  soundEnabled = true,
  image,
  imageScale = 1,
  imageTransparent,
  imageColor,
  label,
  labelColor = '#ffffff',
  labelFontSize = 0.3,
  ...planeProps
}: RoundedShapeButtonProps) {
  const bgRenderOrder = planeProps.renderOrder ?? 0
  // pointerdown 时提前解锁 AudioContext 并播放点击音效（松手前触发，避免按钮卸载导致 click 不触发）
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (soundEnabled) { unlockAudio(); playClick() }
    onPointerDown?.(e)
  }
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    onClick?.(e)
  }
  return (
    <RoundShapePlane
      width={width}
      height={height}
      {...planeProps}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={onPointerUp}
    >
      {image && (
        <ButtonImage
          url={image}
          transparent={imageTransparent}
          color={imageColor}
          width={width * imageScale}
          height={height * imageScale}
          renderOrder={bgRenderOrder + 1}
        />
      )}
      {label && (
        <Text
          font={UI_FONT}
          position={[0, 0, 0.01]}
          fontSize={labelFontSize}
          color={labelColor}
          anchorX="center"
          anchorY="middle"
          renderOrder={bgRenderOrder + 2}
        >
          {label}
        </Text>
      )}
    </RoundShapePlane>
  )
}
