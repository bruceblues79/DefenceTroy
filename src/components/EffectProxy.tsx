import { useQuery, useTrait } from 'koota/react'
import type { Entity } from 'koota'
import { IsEffect, Effect, Position } from '../core/traits'

const EFFECT_COLOR = '#ff8800'

/**
 * 视觉效果代理
 * 渲染所有 IsEffect 实体：AOE 命中等短命圆片
 * - 圆片水平朝上，贴地 y 由 Position.y 决定
 * - opacity = remaining / initial（从 0.6 → 0 淡出）
 * - 不参与 raycaster
 */
export default function EffectProxy() {
  const effects = useQuery(IsEffect, Effect, Position)
  return (
    <>
      {effects.map((entity) => (
        <EffectItem key={entity.id()} entity={entity} />
      ))}
    </>
  )
}

function EffectItem({ entity }: { entity: Entity }) {
  const pos = useTrait(entity, Position)
  const effect = useTrait(entity, Effect)
  if (!pos || !effect) return null

  const progress = Math.max(0, effect.remaining / effect.initial) // 1 → 0
  const opacity = progress * 0.6

  return (
    <mesh
      position={[pos.x, pos.y, pos.z]}
      rotation={[-Math.PI / 2, 0, 0]}
      raycast={() => null}
    >
      <circleGeometry args={[effect.radius, 32]} />
      <meshBasicMaterial
        color={EFFECT_COLOR}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  )
}
