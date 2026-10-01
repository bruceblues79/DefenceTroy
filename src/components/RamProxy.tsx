import { useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/** 木质件颜色（车体、顶棚、攻城梁、立柱） */
const WOOD_COLOR = '#8B5A2B'
/** 轮子颜色（深棕） */
const WHEEL_COLOR = '#3a2a1a'
/** 金属撞头颜色 */
const METAL_COLOR = '#7a7a7a'

/**
 * 攻城车 Proxy（纯视觉形象，无逻辑）
 *
 * 尺寸：宽 ~0.58m（比步兵 0.45m 稍宽）、长 ~1.0m（两个步兵长）、高 ~0.64m
 * 为减少 draw call，同材质几何体用 mergeGeometries 合并：
 *   - 木质件 → 1 mesh
 *   - 4 个轮子 → 1 mesh
 *   - 金属撞头 → 1 mesh
 * 总计 3 draw call。
 */
export default function RamProxy({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  // ── 木质件：底盘 + 顶棚 + 攻城梁 + 两根悬挂立柱 ──
  const woodGeo = useMemo(() => {
    const geos: THREE.BufferGeometry[] = []

    // 底盘：宽 0.58 × 厚 0.08 × 长 0.96，位于轮子上方
    const base = new THREE.BoxGeometry(0.58, 0.08, 0.96)
    base.translate(0, 0.16, 0)
    geos.push(base)

    // 顶棚：宽 0.58 × 厚 0.06 × 长 0.7（短于底盘，前伸攻城梁更突出）
    const roof = new THREE.BoxGeometry(0.58, 0.06, 0.7)
    roof.translate(0, 0.58, 0)
    geos.push(roof)

    // 攻城梁：圆柱沿 z 轴，悬挂于底盘与顶棚之间，略向前（+z）伸出
    const beam = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 12)
    beam.rotateX(Math.PI / 2)
    beam.translate(0, 0.36, 0.05)
    geos.push(beam)

    // 悬挂立柱（左右各一，托住攻城梁）
    const post = new THREE.BoxGeometry(0.04, 0.22, 0.04)
    const postL = post.clone()
    postL.translate(-0.18, 0.36, 0.05)
    geos.push(postL)
    const postR = post.clone()
    postR.translate(0.18, 0.36, 0.05)
    geos.push(postR)

    return mergeGeometries(geos, false)
  }, [])

  // ── 4 个轮子（深棕），合并为单个几何体 ──
  const wheelGeo = useMemo(() => {
    const geos: THREE.BufferGeometry[] = []
    // (x, z) 四轮位置：左右 ±0.26，前后 ±0.36
    const wheelPositions: [number, number][] = [
      [-0.26, -0.36],
      [0.26, -0.36],
      [-0.26, 0.36],
      [0.26, 0.36],
    ]
    for (const [x, z] of wheelPositions) {
      // 圆柱默认沿 y 轴，rotateZ(π/2) 使其轴线沿 x（轮面朝向车身侧面）
      const w = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 14)
      w.rotateZ(Math.PI / 2)
      w.translate(x, 0.12, z)
      geos.push(w)
    }
    return mergeGeometries(geos, false)
  }, [])

  // ── 金属撞头：圆锥朝 +z（城墙方向） ──
  const headGeo = useMemo(() => {
    const head = new THREE.ConeGeometry(0.085, 0.14, 14)
    // 圆锥默认朝 +y，rotateX(-π/2) 使其朝 +z
    head.rotateX(-Math.PI / 2)
    head.translate(0, 0.36, 0.42)
    return head
  }, [])

  return (
    <group position={position}>
      <mesh geometry={woodGeo} castShadow>
        <meshStandardMaterial color={WOOD_COLOR} roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh geometry={wheelGeo} castShadow>
        <meshStandardMaterial color={WHEEL_COLOR} roughness={0.9} />
      </mesh>
      <mesh geometry={headGeo} castShadow>
        <meshStandardMaterial color={METAL_COLOR} metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}
