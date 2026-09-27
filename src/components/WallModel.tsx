import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import type { Mesh } from 'three'
import { WALL_POSITION } from '../core/actions'

const BASE = import.meta.env.BASE_URL

/** 城墙模型（Blender baked PBR：单 mesh + 单贴图，无动画） */
export const WALL_MODEL_URL = `${BASE}assets/glb/sce_wall.glb`

/**
 * 资产原尺寸直接落位：不缩放、不沉底。宽 6 × 高 2.1874 × 厚 0.84，原点在底面中心
 * - 模型原点（底面）坐在地面 y=0，落脚平面（模型 y=2.00，横跨全宽的水平面；
 *   上面 2.05~2.19 那 0.19 是压顶，不是站立面）因此正好落在守军脚底 y=2，无需任何连带改动
 * - 厚 0.84 与游戏值本来就是同一个数
 * - 宽 6 有意超出可视宽（360px 屏 4.5 / 390px 屏 4.875），两端延伸出屏幕：占满屏宽且留余量
 */

export default function WallModel() {
  const { scene } = useGLTF(WALL_MODEL_URL)

  // 城墙只有一个实例，直接用缓存的 scene（角色是多实例才需要 cloneSkeleton）
  const model = useMemo(() => {
    scene.traverse((o) => {
      const m = o as Mesh
      if (m.isMesh) {
        m.castShadow = true
        m.receiveShadow = true
      }
    })
    return scene
  }, [scene])

  return <primitive object={model} position={[WALL_POSITION.x, WALL_POSITION.y, WALL_POSITION.z]} />
}
