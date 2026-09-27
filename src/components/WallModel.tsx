import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import type { Mesh } from 'three'
import { WALL_POSITION } from '../core/actions'

const BASE = import.meta.env.BASE_URL

/** 城墙模型（Blender baked PBR：单 mesh + 单贴图，无动画） */
export const WALL_MODEL_URL = `${BASE}assets/glb/sce_wall.glb`

/**
 * 资产原尺寸进游戏，不做任何缩放：宽 6 × 高 4.3166 × 厚 0.84，原点在底面中心
 * - 宽 6 有意超出可视宽（360px 屏 4.5 / 390px 屏 4.875），两端延伸出屏幕：占满屏宽且留有余量
 * - 厚 0.84 与游戏值本来就是同一个数，z 也不需要动
 * - 竖直方向只做平移：落脚平面（模型 y=4.01，横跨全宽的水平面，AABB 顶 4.3166 那 0.31 是压顶）
 *   对齐守军脚底 y=2 → 模型原点沉到 y=-2.01。
 *   与原来 box「高 4、中心在 y=0、一半埋地下」完全等价：地面以上净高仍是 2.31，
 *   9 个部署格、血条、按钮行、敌方停战线全部无需改动。
 */
const FOOT_PLANE_Y = 4.01
/** 守军脚底高度：与 BattleFieldSpace 部署守军时传入的 y 是同一个平面，改一处要同步另一处 */
const DEPLOY_Y = 2
const ORIGIN_Y = DEPLOY_Y - FOOT_PLANE_Y

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

  return <primitive object={model} position={[WALL_POSITION.x, ORIGIN_Y, WALL_POSITION.z]} />
}
