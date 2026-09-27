import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import type { Mesh } from 'three'
import { WALL_POSITION, WALL_WIDTH } from '../core/actions'

const BASE = import.meta.env.BASE_URL

/** 城墙模型（Blender baked PBR：单 mesh + 单贴图，无动画） */
export const WALL_MODEL_URL = `${BASE}assets/glb/sce_wall.glb`

/**
 * 资产原始尺寸（原点在底面中心）：宽 6 × 高 4.3166 × 厚 0.84
 * - x/y 等比缩到墙宽 WALL_WIDTH(4.5) → scale 0.75，砖纹比例不被压扁
 * - z 不缩放：资产厚度 0.84 已经等于游戏值
 * - 墙顶（守军站立的可行走面）对齐守军脚底 y=2，模型底面因此沉到 y≈-1.24，
 *   等价于原来 box「高 4、中心在 y=0、一半埋地下」的效果：地面以上净高仍是 2.0
 */
const ASSET_WIDTH = 6
const ASSET_HEIGHT = 4.3166
const SCALE = WALL_WIDTH / ASSET_WIDTH
/** 与 BattleFieldSpace 部署守军时传入的 y=2 是同一个平面，改这里要同步改那边 */
const TOP_Y = 2
const ORIGIN_Y = TOP_Y - ASSET_HEIGHT * SCALE

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

  return (
    <primitive
      object={model}
      position={[WALL_POSITION.x, ORIGIN_Y, WALL_POSITION.z]}
      scale={[SCALE, SCALE, 1]}
    />
  )
}
