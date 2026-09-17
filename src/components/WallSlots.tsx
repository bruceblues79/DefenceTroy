import { useQuery } from 'koota/react'
import { type ThreeEvent } from '@react-three/fiber'
import { IsDefender, Position } from '../core/traits'
import { WALL_SLOTS, WALL_POSITION } from '../core/actions'

interface WallSlotsProps {
  /** 拖拽中记录 hover slot 索引（null 表示离开） */
  onSlotOver: (slotIndex: number | null) => void
  /** 松开时落点判定 */
  onSlotUp: (slotIndex: number) => void
}

/**
 * 城墙插槽占位平面
 * 9 个 0.4×0.4 中灰无光平面，贴墙顶上方 0.01
 * 仅在 slot 未被守军占用时渲染（既是视觉提示，也是拖拽落点命中区）
 */
export default function WallSlots({ onSlotOver, onSlotUp }: WallSlotsProps) {
  const defenders = useQuery(IsDefender, Position)

  // 收集被占用 slot 索引（基于 Position.x 匹配 WALL_SLOTS）
  const occupied = new Set<number>()
  defenders.forEach((entity) => {
    const pos = entity.get(Position)
    if (!pos) return
    const idx = WALL_SLOTS.findIndex((x) => Math.abs(x - pos.x) < 0.01)
    if (idx >= 0) occupied.add(idx)
  })

  return (
    <group>
      {WALL_SLOTS.map((x, i) => {
        // 已占用 slot 渲染透明 plane（仅作拖拽落点命中区，不显示视觉占位）
        const isOccupied = occupied.has(i)
        return (
          <mesh
            key={i}
            name={`wall_slot_${i}`}
            position={[x, 2.01, WALL_POSITION.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation()
              onSlotOver(i)
            }}
            onPointerOut={() => onSlotOver(null)}
            onPointerUp={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation()
              onSlotUp(i)
            }}
          >
            <planeGeometry args={[0.4, 0.4]} />
            <meshBasicMaterial
              color="#888888"
              transparent
              opacity={isOccupied ? 0 : 1}
            />
          </mesh>
        )
      })}
    </group>
  )
}
