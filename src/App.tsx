import { Canvas, useThree } from '@react-three/fiber'
import { Environment, OrbitControls, OrthographicCamera, useTexture } from '@react-three/drei'
import { WorldProvider } from 'koota/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { preloadFont } from 'troika-three-text'
import { world } from './core/world'
import { preloadAudio, getListener, getAudioAnchor, unlockAudio } from './core/audio'
import { UI_FONT } from './core/font'
import MainMenuSpace from './spaces/MainMenuSpace'
import LoadingSpace from './spaces/LoadingSpace'
import BattleFieldSpace from './spaces/BattleFieldSpace'
import * as THREE from 'three'

const BASE = import.meta.env.BASE_URL
const BG_ASSET_VERSION = 1
/** 主菜单 / loading 共用底图（1:1 正方形 WebP） */
const BG_URL = `${BASE}assets/textures/main-menu-bg.webp?v=${BG_ASSET_VERSION}`

/**
 * 菜单/加载阶段底图。
 * 用 meshBasicMaterial + toneMapped={false}，不受场景灯光与 HDR 环境贴图影响，颜色准确。
 * 由 gameState 控制显隐，menu 与 loading 共用同一份。
 */
function MenuBackground() {
  const bgTexture = useTexture(BG_URL)
  bgTexture.colorSpace = THREE.SRGBColorSpace
  return (
    <mesh position={[0, 0, 0]} scale={0.5} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[25, 25]} />
      <meshBasicMaterial map={bgTexture} toneMapped={false} />
    </mesh>
  )
}

type GameState = 'menu' | 'loading' | 'play'

// 战斗镜头俯角（自 +Y 轴量起的 polar angle）：正交相机下越倾斜越能露出单位侧面与城墙体积
// 锁定值 —— 进战斗后镜头完全不动（不旋转、不缩放）
const BATTLE_TILT = THREE.MathUtils.degToRad(20)
// 入场推进时长：从正俯视转到 BATTLE_TILT
const TILT_INTRO_MS = 350

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

function useIsLandscape() {
  const [landscape, setLandscape] = useState(
    typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false
  )
  useEffect(() => {
    const update = () => setLandscape(window.innerWidth > window.innerHeight)
    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])
  return landscape
}

function LandscapePrompt() {
  const landscape = useIsLandscape()
  if (!isMobile() || !landscape) return null
  return (
    <div
      style={{
        position: 'fixed',
        top: 8,
        left: 8,
        zIndex: 10,
        padding: '4px 8px',
        fontSize: 12,
        color: '#ccc',
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 4,
        pointerEvents: 'none',
      }}
    >
      请竖屏游玩
    </div>
  )
}

/**
 * 空间音频锚点组件
 * 将 AudioListener 挂载到相机、audioAnchor（PositionalAudio 父节点）挂载到场景。
 * 必须放在 Canvas 内以获取 camera/scene。
 */
function AudioAnchor() {
  const { camera, scene } = useThree()
  useEffect(() => {
    const l = getListener()
    const anchor = getAudioAnchor()
    if (l) camera.add(l)
    scene.add(anchor)
    return () => {
      if (l) camera.remove(l)
      scene.remove(anchor)
    }
  }, [camera, scene])
  return null
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('menu')
  const [paused, setPaused] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [gameResult, setGameResult] = useState<'victory' | 'defeat' | null>(null)
  const orbitRef = useRef<any>(null)
  const handleStart = useCallback(() => setGameState('loading'), [])
  const handleLoaded = useCallback(() => setGameState('play'), [])
  const handlePause = useCallback(() => setPaused(true), [])
  const handleResume = useCallback(() => setPaused(false), [])
  const handleGameOver = useCallback((result: 'victory' | 'defeat') => {
    setGameOver(true)
    setGameResult(result)
  }, [])
  const handleRestart = useCallback(() => {
    setPaused(false)
    setGameOver(false)
    setGameResult(null)
    setGameState('loading')
  }, [])
  const handleExitToMenu = useCallback(() => {
    setPaused(false)
    setGameOver(false)
    setGameResult(null)
    setGameState('menu')
  }, [])

  // 入场：从正俯视推进到 BATTLE_TILT。之后镜头锁死，任何手势都动不了它
  useEffect(() => {
    if (gameState !== 'play') return
    const fromAngle = 0.001
    const startTime = performance.now()
    let rafId = 0
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / TILT_INTRO_MS, 1)
      orbitRef.current?.setPolarAngle(fromAngle + (BATTLE_TILT - fromAngle) * t)
      if (t < 1) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [gameState])

  // 启动时预加载战斗音效
  useEffect(() => {
    preloadAudio()
  }, [])

  // 启动时预加载 UI 字体，避免 loading 阶段 drei <Text> 因字体加载 suspend 冒泡导致闪灰
  useEffect(() => {
    preloadFont({ font: UI_FONT }, () => {})
  }, [])

  // 首次用户手势解锁 AudioContext（浏览器自动播放策略要求）
  useEffect(() => {
    const handler = () => unlockAudio()
    window.addEventListener('pointerdown', handler, { once: true })
    return () => window.removeEventListener('pointerdown', handler)
  }, [])

  return (
    <WorldProvider world={world}>
      <FullscreenPrompt />
      <LandscapePrompt />
      <Canvas dpr={[1, 2]} shadows gl={{ localClippingEnabled: true }}>
        <color attach="background" args={['#888888']} />
        <OrthographicCamera makeDefault position={[0, 9, 0]} zoom={80} />
        <AudioAnchor />
        {/* 镜头锁死：不旋转、不缩放、不平移。
            minPolarAngle 必须留 0 —— setPolarAngle 会把值 clamp 到 [min,max]，
            设成 min=max=20° 会把入场推进动画直接吃掉。用户输入已被 enableRotate 禁掉，不会突破上限 */}
        <OrbitControls
          ref={orbitRef}
          target={[0, 0, 0]}
          enablePan={false}
          enableRotate={false}
          enableZoom={false}
          enableDamping={false}
          minAzimuthAngle={0}
          maxAzimuthAngle={0}
          minPolarAngle={0}
          maxPolarAngle={BATTLE_TILT}
        />
        <directionalLight
          position={[2, 9, -3]}
          intensity={4.5}
          castShadow
          shadow-intensity={2}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
          shadow-camera-near={1}
          shadow-camera-far={30}
        />
        <Environment files={`${import.meta.env.BASE_URL}assets/hdr/battle_field.hdr`} environmentIntensity={0.4} />
        {/* 菜单/加载底图：仅在非战斗阶段显示 */}
        {gameState !== 'play' && <MenuBackground />}
        {gameState === 'menu' && <MainMenuSpace onStart={handleStart} />}
        {gameState === 'loading' && <LoadingSpace onLoaded={handleLoaded} />}
        {gameState === 'play' && (
          <BattleFieldSpace
            paused={paused}
            gameOver={gameOver}
            gameResult={gameResult}
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
