import { useTrait } from 'koota/react'
import type { Entity } from 'koota'
import { Position } from '../core/traits'

interface CharacterProxyProps {
  entity: Entity
  color: string
  /** 盒子尺寸，默认 0.5×1×0.5 */
  size?: [number, number, number]
}

/**
 * 通用角色占位物
 * 从 ECS 读取 Position trait，渲染一个 box 作为单位占位
 */
export default function CharacterProxy({ entity, color, size = [0.45, 1, 0.45] }: CharacterProxyProps) {
  const pos = useTrait(entity, Position)
  if (!pos) return null

  return (
    <mesh position={[pos.x, pos.y, pos.z]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}
