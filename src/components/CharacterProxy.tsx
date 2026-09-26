import { useTrait } from 'koota/react'
import type { Entity } from 'koota'
import { type ThreeEvent } from '@react-three/fiber'
import { Position } from '../core/traits'

interface CharacterProxyProps {
  entity: Entity
  color: string
  /** 盒子尺寸，默认 0.5×1×0.5 */
  size?: [number, number, number]
  /** 拖拽按下回调（仅守军单位传入，敌人不传） */
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void
  /** 拖拽松开回调（敌人单位传入，作为拖拽落点用于更换攻击目标） */
  onPointerUp?: (e: ThreeEvent<PointerEvent>) => void
}

/**
 * 通用角色占位物
 * 从 ECS 读取 Position trait，渲染一个 box 作为单位占位
 * Position.y 语义为「脚底」：box 以中心为原点，故抬升半高
 */
export default function CharacterProxy({ entity, color, size = [0.45, 1, 0.45], onPointerDown, onPointerUp }: CharacterProxyProps) {
  const pos = useTrait(entity, Position)
  if (!pos) return null

  return (
    <mesh
      position={[pos.x, pos.y + size[1] / 2, pos.z]}
      castShadow
      receiveShadow
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}
