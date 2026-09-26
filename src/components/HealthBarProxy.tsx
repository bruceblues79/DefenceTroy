import { Billboard } from '@react-three/drei'
import { useTrait } from 'koota/react'
import type { Entity } from 'koota'
import { Health, Position } from '../core/traits'

interface HealthBarProxyProps {
  entity: Entity
  /** 血条相对 entity Position 的偏移 [x, y, z] */
  offset: [number, number, number]
  /** 血条宽度 */
  width: number
  /** 血条高度，默认 0.035（细条） */
  height?: number
  /** 角色朝向（绕 y 轴），用于把 forwardOffset 转到世界方向；默认 0 */
  yaw?: number
  /** 沿角色 local -z（背后方向）再挪多少，让血条离开头顶正上方；默认 0 */
  forwardOffset?: number
}

const GREEN = '#44aa44'
const RED = '#cc3333'

/**
 * 通用血条占位物
 * 从 ECS 读取 Health + Position，渲染水平细血条
 * - 背景红色 + 前景固定绿色（左对齐收缩）
 * - Billboard 正对相机：相机锁死在 20° 俯角，血条因此带一个固定倾角，
 *   既不像平躺那样被压扁，也不会和角色身体叠在一起
 * - forwardOffset 沿角色 local -z 偏移（按 yaw 旋转到世界），把血条挪到头顶偏身后
 * - 不参与 raycaster，避免干扰拖拽命中
 */
export default function HealthBarProxy({
  entity,
  offset,
  width,
  height = 0.035,
  yaw = 0,
  forwardOffset = 0,
}: HealthBarProxyProps) {
  const pos = useTrait(entity, Position)
  const health = useTrait(entity, Health)
  if (!pos || !health) return null

  const ratio = Math.max(0, Math.min(1, health.current / health.max))
  // local -z 偏移 (0,0,-f) 绕 y 轴转 yaw → 世界 (-f·sin(yaw), 0, -f·cos(yaw))
  const ox = -forwardOffset * Math.sin(yaw)
  const oz = -forwardOffset * Math.cos(yaw)

  return (
    <group position={[pos.x + offset[0] + ox, pos.y + offset[1], pos.z + offset[2] + oz]}>
      <Billboard>
        {/* 背景条 */}
        <mesh raycast={() => null}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial color={RED} toneMapped={false} />
        </mesh>
        {/* 前景血条（左对齐：position.x 偏移 + scale.x 缩放） */}
        <mesh
          position={[-width * (1 - ratio) / 2, 0, 0.001]}
          scale={[ratio, 1, 1]}
          raycast={() => null}
        >
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial color={GREEN} toneMapped={false} />
        </mesh>
      </Billboard>
    </group>
  )
}
