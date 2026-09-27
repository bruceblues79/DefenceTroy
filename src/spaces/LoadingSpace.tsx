import { Billboard, Text, useGLTF, useTexture } from '@react-three/drei'
import { Suspense, useEffect } from 'react'
import { MODEL_URLS } from '../components/CharacterModel'
import { WALL_MODEL_URL } from '../components/WallModel'
import { GROUND_MODEL_URL } from '../components/GroundModel'
import { BUTTON_IMAGES } from './BattleFieldSpace'

function LoadingBillboard() {
  return (
    <Billboard position={[0, 0.1, 0]}>
      <mesh>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <Text position={[0, 0, 0.01]} fontSize={0.25} color="black" anchorX="center" anchorY="middle">
        loading...
      </Text>
    </Billboard>
  )
}

/**
 * 真实预热：5 个角色 GLB + 城墙/地面 GLB + 按钮图标纹理全部就绪后才进入战斗
 * （Suspense 期间显示 loading）。
 * 按钮纹理必须在这里预热 —— BattleFieldSpace 外层没有 Suspense 边界，
 * 未缓存的 useTexture 会在战斗首帧挂起。
 */
function AssetPreloader({ onLoaded }: { onLoaded: () => void }) {
  useGLTF(MODEL_URLS.enemyArcher)
  useGLTF(MODEL_URLS.enemySapper)
  useGLTF(MODEL_URLS.enemyPikeman)
  useGLTF(MODEL_URLS.defenderArcher)
  useGLTF(MODEL_URLS.defenderSpearBreaker)
  useGLTF(WALL_MODEL_URL)
  useGLTF(GROUND_MODEL_URL)
  useTexture(BUTTON_IMAGES)
  useEffect(() => {
    onLoaded()
  }, [onLoaded])
  return null
}

export default function LoadingSpace({ onLoaded }: { onLoaded: () => void }) {
  return (
    <Suspense fallback={<LoadingBillboard />}>
      <AssetPreloader onLoaded={onLoaded} />
    </Suspense>
  )
}
