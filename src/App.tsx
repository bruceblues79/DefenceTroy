import { Canvas } from '@react-three/fiber'
import { OrbitControls, OrthographicCamera } from '@react-three/drei'
import { WorldProvider } from 'koota/react'
import { useEffect, useState } from 'react'
import { world } from './core/world'
import MainMenuSpace from './spaces/MainMenuSpace'
import * as THREE from 'three'

function requestFullscreen() {
  const el = document.documentElement
  if (el.requestFullscreen) el.requestFullscreen()
  else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen()
}

function isMobile() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

function useFullscreenPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isMobile()) return
    const update = () => setShow(!document.fullscreenElement)
    update()
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])

  return { show, request: requestFullscreen }
}

function FullscreenPrompt() {
  const { show, request } = useFullscreenPrompt()
  if (!show) return null
  return (
    <button
      onClick={request}
      style={{
        position: 'absolute',
        top: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        padding: '4px 12px',
        fontSize: 12,
        color: '#ccc',
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 4,
        cursor: 'pointer',
      }}
    >
      进入全屏
    </button>
  )
}

export default function App() {
  return (
    <WorldProvider world={world}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <FullscreenPrompt />
        <Canvas dpr={[1, 2]}>
          <color attach="background" args={['#6b7280']} />
          <OrthographicCamera makeDefault position={[0, 9, 0]} zoom={80} />
          <OrbitControls
            target={[0, 0, 0]}
            enablePan={false}
            minZoom={60}
            maxZoom={100}
            minAzimuthAngle={0}
            maxAzimuthAngle={0}
            minPolarAngle={0.001}
            maxPolarAngle={THREE.MathUtils.degToRad(30)}
          />
          <directionalLight position={[2, 9, 0]} />
          <MainMenuSpace />
        </Canvas>
      </div>
    </WorldProvider>
  )
}
