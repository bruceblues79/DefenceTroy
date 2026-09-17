import { useTrait } from 'koota/react'
import type { Entity } from 'koota'
import { Health, Position } from '../core/traits'

interface HealthBarProxyProps {
  entity: Entity
  /** 血条相对 entity Position 的偏移 [x, y, z] */
  offset: [number, number, number]
  /** 血条宽度 */
  width: number
  /** 血条高度，默认 0.06 */
  height?: number
}

const GREEN = '#44aa44'
const RED = '#cc3333'

/**
 * 通用血条占位物
 * 从 ECS 读取 Health + Position，渲染水平血条
 * - hp > 50% 绿；≤ 50% 红
 * - 背景条（半透黑）+ 前景血条左对齐，长度 = width * (current/max)
 * - 不参与 raycaster，避免干扰拖拽命中
 */
export default function HealthBarProxy({ entity, offset, width, height = 0.06 }: HealthBarProxyProps) {
  const pos = useTrait(entity, Position)
  const health = useTrait(entity, Health)
  if (!pos || !health) return null

  const ratio = Math.max(0, Math.min(1, health.current / health.max))
  const color = ratio > 0.5 ? GREEN : RED

  return (
    <group position={[pos.x + offset[0], pos.y + offset[1], pos.z + offset[2]]}>
      {/* 背景条 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#333333" transparent opacity={0.5} />
      </mesh>
      {/* 前景血条（左对齐：position.x 偏移 + scale.x 缩放） */}
      <mesh
        position={[-width * (1 - ratio) / 2, 0, 0.001]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[ratio, 1, 1]}
        raycast={() => null}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  )
}
