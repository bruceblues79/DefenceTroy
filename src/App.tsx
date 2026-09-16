import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, OrthographicCamera } from '@react-three/drei'
import { WorldProvider } from 'koota/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { world } from './core/world'
import MainMenuSpace from './spaces/MainMenuSpace'
import LoadingSpace from './spaces/LoadingSpace'
import BattleFieldSpace from './spaces/BattleFieldSpace'
import * as THREE from 'three'

type GameState = 'menu' | 'loading' | 'play'

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
        position: 'fixed',
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
  const [gameState, setGameState] = useState<GameState>('menu')
  const [paused, setPaused] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const orbitRef = useRef<any>(null)
  const handleStart = useCallback(() => setGameState('loading'), [])
  const handleLoaded = useCallback(() => setGameState('play'), [])
  const handlePause = useCallback(() => setPaused(true), [])
  const handleResume = useCallback(() => setPaused(false), [])
  const handleGameOver = useCallback(() => setGameOver(true), [])
  const handleRestart = useCallback(() => {
    setPaused(false)
    setGameOver(false)
    setGameState('loading')
  }, [])
  const handleExitToMenu = useCallback(() => {
    setPaused(false)
    setGameOver(false)
    setGameState('menu')
  }, [])

  useEffect(() => {
    if (gameState !== 'play') return
    setCameraReady(false)
    const fromAngle = 0.001
    const toAngle = THREE.MathUtils.degToRad(7.5)
    const duration = 100
    const startTime = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1)
      const angle = fromAngle + (toAngle - fromAngle) * t
      orbitRef.current?.setPolarAngle(angle)
      if (t < 1) requestAnimationFrame(tick)
      else setCameraReady(true)
    }
    const rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [gameState])

  return (
    <WorldProvider world={world}>
      <FullscreenPrompt />
      <Canvas dpr={[1, 2]} shadows>
        <color attach="background" args={['#6b7280']} />
        <OrthographicCamera makeDefault position={[0, 9, 0]} zoom={80} />
        <OrbitControls
          ref={orbitRef}
          target={[0, 0, 0]}
          enablePan={false}
          enableRotate={gameState === 'play' && cameraReady && !paused && !gameOver}
          enableDamping={false}
          minZoom={60}
          maxZoom={100}
          minAzimuthAngle={0}
          maxAzimuthAngle={0}
          minPolarAngle={0}
          maxPolarAngle={THREE.MathUtils.degToRad(10)}
        />
        <directionalLight
          position={[2, 9, -3]}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
          shadow-camera-near={1}
          shadow-camera-far={30}
        />
        <Environment files={`${import.meta.env.BASE_URL}assets/hdr/battle_field.hdr`} />
        {gameState === 'menu' && <MainMenuSpace onStart={handleStart} />}
        {gameState === 'loading' && <LoadingSpace onLoaded={handleLoaded} />}
        {gameState === 'play' && (
          <BattleFieldSpace
            paused={paused}
            gameOver={gameOver}
            onPause={handlePause}
            onResume={handleResume}
            onRestart={handleRestart}
            onExitToMenu={handleExitToMenu}
            onGameOver={handleGameOver}
          />
        )}
      </Canvas>
    </WorldProvider>
  )
}
