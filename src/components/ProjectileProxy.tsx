import { useTrait } from 'koota/react'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { Mesh } from 'three'
import type { Entity } from 'koota'
import { Position, Velocity } from '../core/traits'

const _aim = new Vector3()

// 矛比箭长：箭 0.3，矛 0.55（都沿 local +z，靠 lookAt 指向飞行方向）
const ARROW_SIZE: [number, number, number] = [0.05, 0.05, 0.3]
const SPEAR_SIZE: [number, number, number] = [0.06, 0.06, 0.55]

/**
 * 飞行朝向：每帧把占位物的长轴（local +z）转到速度方向，带俯仰角。
 * 朝向是纯视觉，不进 core —— velocity 已在 ECS 里，渲染层直接读。
 */
function useAimAlongVelocity(entity: Entity) {
  const ref = useRef<Mesh>(null)
  const vel = useTrait(entity, Velocity)

  useFrame(() => {
    const mesh = ref.current
    if (!mesh || !vel) return
    if (vel.x === 0 && vel.y === 0 && vel.z === 0) return
    _aim.set(mesh.position.x + vel.x, mesh.position.y + vel.y, mesh.position.z + vel.z)
    mesh.lookAt(_aim)
  })

  return ref
}

interface ProjectileProxyProps {
  entity: Entity
  color?: string
}

/** 箭矢占位物（细短 box） */
export function ArrowProxy({ entity, color = '#8b4513' }: ProjectileProxyProps) {
  const pos = useTrait(entity, Position)
  const ref = useAimAlongVelocity(entity)
  if (!pos) return null

  return (
    <mesh ref={ref} position={[pos.x, pos.y, pos.z]}>
      <boxGeometry args={ARROW_SIZE} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

/** 长矛占位物（更长更粗的 box）：长枪兵 / 破矛兵投掷 */
export function SpearProxy({ entity, color = '#6b4f2a' }: ProjectileProxyProps) {
  const pos = useTrait(entity, Position)
  const ref = useAimAlongVelocity(entity)
  if (!pos) return null

  return (
    <mesh ref={ref} position={[pos.x, pos.y, pos.z]}>
      <boxGeometry args={SPEAR_SIZE} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}
