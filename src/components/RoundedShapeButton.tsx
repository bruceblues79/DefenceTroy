import { type ThreeEvent } from '@react-three/fiber'
import { Text, useTexture } from '@react-three/drei'
import RoundShapePlane from './RoundShapePlane'

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
  // ── 可选图片槽位 ──
  /** 图片 URL;提供时在 localZ +0.005 渲染一个透明图片平面 */
  image?: string
  /** 图片是否透明,默认 true */
  imageTransparent?: boolean
  // ── 可选文字标签 ──
  /** 按钮文字;提供时在按钮表面 localZ +0.01 渲染 */
  label?: string
  labelColor?: string
  labelFontSize?: number
}

/**
 * 图片槽位子组件
 * 独立组件以避免 useTexture 的条件 hook 调用。
 * 当前用最小实现(planeGeometry args=[1,1] 不缩放),
 * 将来启用图片时再决定缩放策略。
 */
function ButtonImage({ url, transparent }: { url: string; transparent?: boolean }) {
  const tex = useTexture(url)
  return (
    <mesh position={[0, 0, 0.005]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent={transparent ?? true} depthWrite={false} toneMapped={false} />
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
  onClick,
  onPointerDown,
  onPointerUp,
  image,
  imageTransparent,
  label,
  labelColor = '#ffffff',
  labelFontSize = 0.3,
  ...planeProps
}: RoundedShapeButtonProps) {
  return (
    <RoundShapePlane {...planeProps} onClick={onClick} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      {image && <ButtonImage url={image} transparent={imageTransparent} />}
      {label && (
        <Text
          position={[0, 0, 0.01]}
          fontSize={labelFontSize}
          color={labelColor}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </RoundShapePlane>
  )
}
