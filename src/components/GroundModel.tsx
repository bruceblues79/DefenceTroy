import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import type { Mesh } from 'three'

const BASE = import.meta.env.BASE_URL

/** 地面模型（Blender 导出：单平面 mesh + 单张手绘沙地贴图，无动画） */
export const GROUND_MODEL_URL = `${BASE}assets/glb/sce_ground.glb`

/**
 * 资产原尺寸直接落位：不缩放。
 * - AABB 15 × 0 × 15（原点在几何中心），平面位于 y=0，覆盖范围远大于屏幕可视区。
 * - 材质带 KHR_materials_unlit（three.js 会解析为 MeshBasicMaterial），
 *   因此它**不受实时光照、也不接收阴影**；贴图本身已带手绘光影。
 *   若后续希望它像旧地面一样接收单位/城墙阴影，可 override 成 MeshStandardMaterial（保留贴图）。
 */
export default function GroundModel() {
  const { scene } = useGLTF(GROUND_MODEL_URL)

  const model = useMemo(() => {
    scene.traverse((o) => {
      const m = o as Mesh
      if (m.isMesh) {
        m.castShadow = false
        m.receiveShadow = true // unlit 材质下无实际作用；保留以便将来切换 Standard 时自动生效
      }
    })
    return scene
  }, [scene])

  return <primitive object={model} position={[0, 0, 0]} />
}
