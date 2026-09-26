import { useAnimations, useGLTF } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'
import type { Entity } from 'koota'
import { Attack, Health, Position, Velocity } from '../core/traits'

const BASE = import.meta.env.BASE_URL

/** 角色模型文件（攻守弓手分文件：敌我不共用贴图） */
export const MODEL_URLS = {
  enemyArcher: `${BASE}assets/glb/char_archer_atk.glb`,
  enemySapper: `${BASE}assets/glb/char_sapper.glb`,
  enemyPikeman: `${BASE}assets/glb/char_pikeman.glb`,
  defenderArcher: `${BASE}assets/glb/char_archer_def.glb`,
  defenderSpearBreaker: `${BASE}assets/glb/char_spear_breaker.glb`,
} as const

export type ModelKey = keyof typeof MODEL_URLS

/**
 * 模型朝向：资产正面朝 +z（长枪/破矛兵的兵器向 -z 拖在身后）
 * - 守军站墙上要正对来敌（敌人在 -z 方向）→ 旋转 180°
 * - 敌人朝 +z 的城墙进军 → 不旋转
 */
export const MODEL_YAW: Record<ModelKey, number> = {
  enemyArcher: 0,
  enemySapper: 0,
  enemyPikeman: 0,
  defenderArcher: Math.PI,
  defenderSpearBreaker: Math.PI,
}

/** 单位统一缩放：资产标准身高约 1.5m，游戏内按 0.4 缩到约 0.6m */
const MODEL_SCALE = 0.4

type ClipName = 'guard' | 'move' | 'atk' | 'hurt' | 'die'

/** clip 名按后缀匹配：破矛兵共用长枪兵动画（clip 前缀仍是 pikeman），按后缀取可绕开前缀差异 */
const CLIP_SUFFIX: Record<ClipName, string> = {
  guard: '_guard',
  move: '_move',
  atk: '_atk',
  hurt: '_hurt',
  die: '_die',
}

/** attack 起手 0.4s 内受伤只掉血，不播 hurt */
const ATTACK_PROTECT = 0.4
const HURT_DURATION = 0.2
const CROSSFADE = 0.12

export interface DeathInfo {
  modelKey: ModelKey
  position: [number, number, number]
  yaw: number
}

/** 克隆骨架模型（蒙皮网格必须用 SkeletonUtils.clone）+ 绑定动作 */
function useCharacterClips(modelKey: ModelKey, root: React.RefObject<THREE.Group>) {
  const { scene, animations } = useGLTF(MODEL_URLS[modelKey])
  const model = useMemo(() => {
    const m = cloneSkeleton(scene)
    m.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
    return m
  }, [scene])
  const { actions } = useAnimations(animations, root)
  return { model, actions }
}

/**
 * 按后缀取动作。
 * ⚠️ 必须「用时再取」：useAnimations 的 actions 是懒解析 getter，render 阶段 ref 还是 null，
 * 那时解析会得到 undefined 且不会重试——所以绝不能在 useMemo 里把 action 缓存下来。
 */
function findAction(actions: Record<string, THREE.AnimationAction | null>, suffix: string) {
  for (const name of Object.keys(actions)) {
    const action = actions[name]
    if (action && name.endsWith(suffix)) return action
  }
  return undefined
}

/**
 * 角色模型（ECS 驱动 + 自管动画状态机）
 *
 * 状态机不新增 ECS 字段，全部挂在既有 trait 上：
 * - attack：Attack.isAttacking 上升沿触发，一条指令播一次，播完回 guard/move
 * - hurt：Health.current 下降触发；guard/move 中打断重播，attack 中 0.4s 保护过后可插入，
 *   插入后 attack 视为取消，hurt 播完回 guard/move（不续播 attack）
 * - move/guard：Velocity 是否为零
 * - die：血量归零后由逻辑层销毁实体，尸体由渲染层 CorpseModel 接着播（见 UnitRenderer）
 */
export default function CharacterModel({
  entity,
  modelKey,
  yaw,
  onPointerDown,
  onPointerUp,
  onDeath,
}: {
  entity: Entity
  modelKey: ModelKey
  yaw: number
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void
  onPointerUp?: (e: ThreeEvent<PointerEvent>) => void
  onDeath?: (info: DeathInfo) => void
}) {
  const group = useRef<THREE.Group>(null!)
  const { model, actions } = useCharacterClips(modelKey, group)
  const clipOf = (name: ClipName) => findAction(actions, CLIP_SUFFIX[name])

  const st = useRef({
    state: 'guard' as ClipName,
    endsAt: 0,
    protectUntil: 0,
    wasAttacking: false,
    lastHp: Infinity,
    lastPos: [0, 0, 0] as [number, number, number],
    playing: null as ClipName | null,
  })

  const onDeathRef = useRef(onDeath)
  onDeathRef.current = onDeath

  // 实体卸载（死亡或被回收）：只有血量归零才算死亡，才交给渲染层播 die
  useEffect(
    () => () => {
      if (st.current.lastHp <= 0) {
        onDeathRef.current?.({ modelKey, position: st.current.lastPos, yaw })
      }
    },
    [modelKey, yaw],
  )

  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const pos = entity.get(Position)
    if (pos) {
      g.position.set(pos.x, pos.y, pos.z)
      st.current.lastPos = [pos.x, pos.y, pos.z]
    }

    const t = clock.elapsedTime
    const s = st.current

    const playClip = (next: ClipName, at?: number) => {
      const action = clipOf(next)
      if (!action) return
      const prev = s.playing ? clipOf(s.playing) : null
      const loop = next === 'guard' || next === 'move'
      action.reset()
      if (at !== undefined) action.time = at
      action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1)
      action.clampWhenFinished = next === 'die'
      if (prev && prev !== action) prev.fadeOut(CROSSFADE)
      action.fadeIn(next === 'hurt' ? CROSSFADE / 2 : CROSSFADE).play()
      s.playing = next
    }

    const health = entity.get(Health)
    let damaged = false
    if (health) {
      // 首帧 lastHp 还是 Infinity，此时只记录基准值，不算受击（否则每个单位出生都会播一次 hurt）
      damaged = Number.isFinite(s.lastHp) && health.current < s.lastHp
      s.lastHp = health.current
      if (health.current <= 0) {
        if (s.state !== 'die') {
          s.state = 'die'
          playClip('die')
        }
        return
      }
    }

    const vel = entity.get(Velocity)
    const moving = vel ? Math.hypot(vel.x, vel.z) > 0.01 : false
    const base: ClipName = moving ? 'move' : 'guard'

    // 首次进入：立刻起播当前基础动作（否则会停在绑定姿势不动）
    if (!s.playing) {
      playClip(base)
      s.state = base
    }

    // 一次性动作（atk / hurt）播完即回基础动作，绝不自动续播 attack
    if ((s.state === 'atk' || s.state === 'hurt') && t >= s.endsAt) {
      playClip(base)
      s.state = base
      s.protectUntil = 0
    }

    const attack = entity.get(Attack)
    const attacking = attack?.isAttacking ?? false
    const rising = attacking && !s.wasAttacking
    s.wasAttacking = attacking

    // 攻击指令：一条指令只播一次 atk。clip 长于 interval 时会被下一条指令截断重播
    if (rising && s.state !== 'die') {
      playClip('atk')
      s.state = 'atk'
      s.endsAt = t + (clipOf('atk')?.getClip().duration ?? 0)
      s.protectUntil = t + ATTACK_PROTECT
    }

    // 受伤：attack 起手 0.4s 保护期内只掉血；过后打断当前动作播 hurt，
    // 被打断的 attack 就此取消（播完 hurt 回 guard/move，不再续播）
    if (damaged && s.state !== 'die') {
      const inProtect = s.state === 'atk' && t < s.protectUntil
      if (!inProtect) {
        playClip('hurt')
        s.state = 'hurt'
        s.endsAt = t + HURT_DURATION
        s.protectUntil = 0
      }
    }

    // 站立/移动态随速度切换
    if (s.state === 'guard' || s.state === 'move') {
      if (s.state !== base) {
        playClip(base)
        s.state = base
      }
    }
  })

  return (
    <group ref={group} rotation={[0, yaw, 0]}>
      <group scale={MODEL_SCALE}>
        <primitive object={model} />
      </group>
      {/* 命中区：模型细长，用不可见盒子保证拖拽/选敌稳定（贴合缩放后身高约 0.6） */}
      <mesh position={[0, 0.4, 0]} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        <boxGeometry args={[0.4, 0.8, 0.4]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  )
}

/** 尸体：独立播放 die，播完消失（不参与任何战斗逻辑） */
export function CorpseModel({
  modelKey,
  position,
  yaw,
  onDone,
}: {
  modelKey: ModelKey
  position: [number, number, number]
  yaw: number
  onDone: () => void
}) {
  const group = useRef<THREE.Group>(null!)
  const { model, actions } = useCharacterClips(modelKey, group)

  // onDone 是父层内联函数，用 ref 持有并只播一次，避免父层重渲染导致 die 反复重播
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const played = useRef(false)

  useEffect(() => {
    if (played.current) return
    const action = findAction(actions, CLIP_SUFFIX.die)
    if (!action) return
    played.current = true
    action.reset().setLoop(THREE.LoopOnce, 1)
    action.clampWhenFinished = true
    action.play()
    const timer = setTimeout(() => onDoneRef.current(), action.getClip().duration * 1000)
    return () => clearTimeout(timer)
  }, [actions])

  return (
    <group ref={group} position={position} rotation={[0, yaw, 0]}>
      <group scale={MODEL_SCALE}>
        <primitive object={model} />
      </group>
    </group>
  )
}
