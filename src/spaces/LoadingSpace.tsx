import { Billboard, Text, useGLTF } from '@react-three/drei'
import { Suspense, useEffect } from 'react'
import { MODEL_URLS } from '../components/CharacterModel'

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

/** 真实预热：5 个角色 GLB 全部就绪后才进入战斗（Suspense 期间显示 loading） */
function CharacterPreloader({ onLoaded }: { onLoaded: () => void }) {
  useGLTF(MODEL_URLS.enemyArcher)
  useGLTF(MODEL_URLS.enemySapper)
  useGLTF(MODEL_URLS.enemyPikeman)
  useGLTF(MODEL_URLS.defenderArcher)
  useGLTF(MODEL_URLS.defenderSpearBreaker)
  useEffect(() => {
    onLoaded()
  }, [onLoaded])
  return null
}

export default function LoadingSpace({ onLoaded }: { onLoaded: () => void }) {
  return (
    <Suspense fallback={<LoadingBillboard />}>
      <CharacterPreloader onLoaded={onLoaded} />
    </Suspense>
  )
}
