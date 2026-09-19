import { useMemo } from 'react'
import * as THREE from 'three'
import { type ThreeEvent } from '@react-three/fiber'
import type { ReactNode } from 'react'

interface RoundShapePlaneProps {
  /** 宽,默认 0.5 */
  width?: number
  /** 高,默认 0.5 */
  height?: number
  /** 圆角半径,默认 0.1。内部 clamp 到 min(width,height)/2 防止溢出 */
  cornerRadius?: number
  /** 每角弧段数,默认 8。= 0 时退化为硬倒角(八角形斜切,斜切长度 = cornerRadius) */
  cornerSegments?: number
  /** 颜色,默认 '#ffffff' */
  color?: string
  /** 不透明度,默认 1。< 1 时自动 transparent=true */
  opacity?: number
  /** 深度测试,默认 true。ShopScreen 等需传 false */
  depthTest?: boolean
  /** 渲染顺序,默认 0 */
  renderOrder?: number
  /** toneMapped,默认 false(与既有 UI 一致) */
  toneMapped?: boolean
  /** 透传到 mesh */
  position?: [number, number, number]
  rotation?: [number, number, number]
  name?: string
  onClick?: (e: ThreeEvent<MouseEvent>) => void
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void
  onPointerUp?: (e: ThreeEvent<PointerEvent>) => void
  children?: ReactNode
}

/**
 * 用绝对坐标构建圆角矩形 Shape。
 * 圆弧半径 r 与 width/height 解耦,仅通过 clamp 上限关联 →
 * 改 width/height 时圆角半径不变 → 形状不异形。
 * segments=0 时跳过 absarc,用 lineTo 画对角斜切(硬倒角)。
 */
function makeRoundedRectShape(width: number, height: number, radius: number, segments: number): THREE.Shape {
  const w = Math.max(0, width) / 2
  const h = Math.max(0, height) / 2
  const r = Math.min(Math.max(0, radius), Math.min(w, h))
  const shape = new THREE.Shape()
  if (r === 0) {
    shape.moveTo(-w, -h)
    shape.lineTo(w, -h)
    shape.lineTo(w, h)
    shape.lineTo(-w, h)
    shape.lineTo(-w, -h)
    return shape
  }
  const cw = w - r // 圆角中心 X
  const ch = h - r // 圆角中心 Y
  shape.moveTo(-cw, -h)
  shape.lineTo(cw, -h) // 下边
  if (segments > 0) shape.absarc(cw, -ch, r, -Math.PI / 2, 0, false) // 右下圆弧
  else shape.lineTo(w, -ch) // 右下硬倒角
  shape.lineTo(w, ch) // 右边
  if (segments > 0) shape.absarc(cw, ch, r, 0, Math.PI / 2, false) // 右上圆弧
  else shape.lineTo(cw, h) // 右上硬倒角
  shape.lineTo(-cw, h) // 上边
  if (segments > 0) shape.absarc(-cw, ch, r, Math.PI / 2, Math.PI, false) // 左上圆弧
  else shape.lineTo(-w, ch) // 左上硬倒角
  shape.lineTo(-w, -ch) // 左边
  if (segments > 0) shape.absarc(-cw, -ch, r, Math.PI, 3 * Math.PI / 2, false) // 左下圆弧
  else shape.lineTo(-cw, -h) // 左下硬倒角
  return shape
}

/**
 * 程序化圆角面片
 * 用 THREE.Shape 构建圆角矩形,ShapeGeometry 生成 2D 平面,无光材质。
 * 可用作按钮底色、菜单底色、界面底色的基础 panel。
 */
export default function RoundShapePlane({
  width = 0.5,
  height = 0.5,
  cornerRadius = 0.1,
  cornerSegments = 8,
  color = '#ffffff',
  opacity = 1,
  depthTest = true,
  renderOrder = 0,
  toneMapped = false,
  position,
  rotation,
  name,
  onClick,
  onPointerDown,
  onPointerUp,
  children,
}: RoundShapePlaneProps) {
  const geometry = useMemo(() => {
    const shape = makeRoundedRectShape(width, height, cornerRadius, cornerSegments)
    return new THREE.ShapeGeometry(shape)
  }, [width, height, cornerRadius, cornerSegments])

  return (
    <mesh
      name={name}
      geometry={geometry}
      position={position}
      rotation={rotation}
      renderOrder={renderOrder}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <meshBasicMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        depthTest={depthTest}
        toneMapped={toneMapped}
      />
      {children}
    </mesh>
  )
}
