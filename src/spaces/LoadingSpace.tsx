import { Billboard, Text, useGLTF, useTexture } from '@react-three/drei'
import { Image } from '@react-three/uikit'
import { Suspense, useEffect } from 'react'
import { MODEL_URLS } from '../components/CharacterModel'
import { WALL_MODEL_URL } from '../components/WallModel'
import { GROUND_MODEL_URL } from '../components/GroundModel'
import { BUTTON_IMAGES } from './BattleFieldSpace'
import { SHOP_TAB_IMAGES } from './ShopScreen'
import { UI_FONT } from '../core/font'
import { BG_URL } from './MainMenuSpace'

/**
 * loading 时的底图 + 文字。
 * 底图与主菜单共用同一张，useTexture 命中 drei 缓存（menu 阶段已加载），不会 suspend。
 */
function LoadingBillboard() {
  const bgTexture = useTexture(BG_URL)
  return (
    <group>
      {/* 底图：与主菜单一致，scale 0.5，躺在 XZ 平面 */}
      <group position={[0, 0, 0]} scale={0.5} rotation={[-Math.PI / 2, 0, 0]}>
        <Image src={bgTexture} sizeX={2500} sizeY={2500} />
      </group>
      {/* loading 文字，面向相机 */}
      <Billboard position={[0, 0.1, 0]}>
        <Text font={UI_FONT} position={[0, 0, 0.01]} fontSize={0.25} color="black" anchorX="center" anchorY="middle">
          loading...
        </Text>
      </Billboard>
    </group>
  )
}

/**
 * 真实预热：5 个角色 GLB + 城墙/地面 GLB + 按钮图标纹理 + 底图全部就绪后才进入战斗
 * （Suspense 期间显示 loading 底图）。
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
  useTexture(SHOP_TAB_IMAGES)
  useTexture(BG_URL)
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
