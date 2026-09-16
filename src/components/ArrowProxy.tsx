import { useTrait } from 'koota/react'
import type { Entity } from 'koota'
import { Position } from '../core/traits'

interface ArrowProxyProps {
  entity: Entity
  color?: string
}

/**
 * 箭矢占位物（小 box）
 * 从 ECS 读取 Position trait
 */
export default function ArrowProxy({ entity, color = '#8b4513' }: ArrowProxyProps) {
  const pos = useTrait(entity, Position)
  if (!pos) return null

  return (
    <mesh position={[pos.x, pos.y, pos.z]}>
      <boxGeometry args={[0.05, 0.05, 0.3]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}
