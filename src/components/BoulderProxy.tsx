import { useTrait } from 'koota/react'
import type { Entity } from 'koota'
import { Position } from '../core/traits'

interface BoulderProxyProps {
  entity: Entity
}

/**
 * 石块占位物
 * 从 ECS 读取 Position，渲染一个灰褐色正方块
 */
export default function BoulderProxy({ entity }: BoulderProxyProps) {
  const pos = useTrait(entity, Position)
  if (!pos) return null

  return (
    <mesh position={[pos.x, pos.y, pos.z]} castShadow>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color="#8b6914" />
    </mesh>
  )
}
