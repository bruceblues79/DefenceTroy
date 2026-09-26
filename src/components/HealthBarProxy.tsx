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
}

const GREEN = '#44aa44'
const RED = '#cc3333'

/**
 * 通用血条占位物
 * 从 ECS 读取 Health + Position，渲染水平细血条
 * - 背景红色 + 前景固定绿色（左对齐收缩）
 * - Billboard 正对相机：相机锁死在 20° 俯角，血条因此带一个固定倾角，
 *   既不像平躺那样被压扁，也不会和角色身体叠在一起
 * - offset 是世界偏移，z 分量为正 = 往 +z（靠近相机侧、屏幕下方）挪，把血条从头顶挪开。
 *   正交相机没有透视收缩，要在屏幕上拉开距离只能靠世界坐标的真实位移
 * - 不参与 raycaster，避免干扰拖拽命中
 */
export default function HealthBarProxy({ entity, offset, width, height = 0.035 }: HealthBarProxyProps) {
  const pos = useTrait(entity, Position)
  const health = useTrait(entity, Health)
  if (!pos || !health) return null

  const ratio = Math.max(0, Math.min(1, health.current / health.max))

  return (
    <group position={[pos.x + offset[0], pos.y + offset[1], pos.z + offset[2]]}>
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
