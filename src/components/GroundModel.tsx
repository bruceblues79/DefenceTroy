import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import { RepeatWrapping } from 'three'
import type { Mesh, MeshStandardMaterial, Texture } from 'three'

const BASE = import.meta.env.BASE_URL

/** 地面模型（Blender 导出：单平面 mesh + 单张手绘沙地贴图，无动画） */
export const GROUND_MODEL_URL = `${BASE}assets/glb/sce_ground.glb`

/**
 * 贴图平铺次数：资产 UV 是 0–1 铺满整块 15×15（512×512 拉满 15m ≈ 34 texel/m，过稀）。
 * 用户要求重复 5×5 → 每个 tile 覆盖 3×3m，约 170 texel/m。
 */
const UV_REPEAT = 5

/**
 * 资产原尺寸直接落位：不缩放、不位移（贴图平铺次数按 UV_REPEAT 在代码侧设定）。
 * - AABB 15 × 0 × 15（原点在几何中心），平面位于 y=0，覆盖范围远大于屏幕可视区。
 * - 材质是标准 PBR（metallic 0，roughness 未指定 → 默认 1）+ 512×512 WebP 手绘贴图，
 *   与场景光照/阴影一致：receiveShadow 生效，单位与城墙会投影到地面上。
 */
export default function GroundModel() {
  const { scene } = useGLTF(GROUND_MODEL_URL)

  const model = useMemo(() => {
    scene.traverse((o) => {
      const m = o as Mesh
      if (m.isMesh) {
        m.castShadow = false
        m.receiveShadow = true
        const map = (m.material as MeshStandardMaterial).map as Texture | null
        if (map) {
          map.wrapS = RepeatWrapping
          map.wrapT = RepeatWrapping
          map.repeat.set(UV_REPEAT, UV_REPEAT)
          map.needsUpdate = true
        }
      }
    })
    return scene
  }, [scene])

  return <primitive object={model} position={[0, 0, 0]} />
}
