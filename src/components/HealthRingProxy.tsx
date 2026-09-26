import { useTrait } from 'koota/react'
import { useMemo } from 'react'
import type { Entity } from 'koota'
import * as THREE from 'three'
import { Health, Position } from '../core/traits'

interface HealthRingProxyProps {
  entity: Entity
  /** 环外半径 */
  radius: number
  /** 环相对 entity Position.y 的高度偏移（挂在腰部，不是头顶） */
  yOffset: number
  /** 内半径占外半径的比例，环宽 = radius × (1 - innerRatio)，默认 0.55 */
  innerRatio?: number
}

const GREEN = '#44aa44'
const RED = '#cc3333'
const OPACITY = 0.95

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

/**
 * 血量圆环：uv → 极坐标，用 uRatio 切分红绿弧长
 * - t ∈ [0,1) 是绕环一圈的进度，从 12 点方向起顺时针
 * - 绿 = 剩余血量（t < uRatio），红 = 已损失（t > uRatio）
 * - 末尾必须 include colorspace_fragment：自定义 shader 不接 three 的色彩管线，
 *   直接输出会偏白
 */
const FRAGMENT_SHADER = `
uniform float uRatio;
uniform float uInner;
uniform float uOpacity;
uniform vec3 uGreen;
uniform vec3 uRed;
varying vec2 vUv;

void main() {
  vec2 p = vUv - 0.5;
  float r = length(p) * 2.0;
  if (r > 1.0 || r < uInner) discard;

  float t = fract(atan(p.x, p.y) / 6.2831853);

  // 红绿分界：用回绕后的角度差做羽化，避免 12 点处硬边；满血时直接全绿
  float w = 0.0;
  if (uRatio < 0.999) {
    float d = t - uRatio;
    d -= floor(d + 0.5);
    w = smoothstep(-0.003, 0.003, d);
  }
  vec3 col = mix(uGreen, uRed, w);

  // 内外边缘羽化，环细时不至于锯齿
  float edge = min(smoothstep(0.0, 0.06, r - uInner), smoothstep(0.0, 0.06, 1.0 - r));
  gl_FragColor = vec4(col, uOpacity * edge);

  #include <colorspace_fragment>
}
`

/**
 * 角色血量圆环（水平躺平，围绕角色腰部）
 * 从 ECS 读取 Health + Position，用 shader 按百分比映射红绿弧长
 * - yOffset 挂在腰部而非头顶：相机倾斜后头顶血条会和身体叠在一起，腰环也避开了
 *   城墙对贴墙单位的遮挡（攻城兵 z≈1.95 时脚下会被城墙吃掉）
 * - 不参与 raycaster，避免拦截拖拽命中
 */
export default function HealthRingProxy({
  entity,
  radius,
  yOffset,
  innerRatio = 0.55,
}: HealthRingProxyProps) {
  const pos = useTrait(entity, Position)
  const health = useTrait(entity, Health)

  // 每个实例独立 uniforms（血量各不相同），材质由 R3F 创建并随组件卸载销毁
  const uniforms = useMemo(
    () => ({
      uRatio: { value: 1 },
      uInner: { value: innerRatio },
      uOpacity: { value: OPACITY },
      uGreen: { value: new THREE.Color(GREEN) },
      uRed: { value: new THREE.Color(RED) },
    }),
    [innerRatio],
  )

  if (!pos || !health) return null

  const ratio = Math.max(0, Math.min(1, health.current / health.max))
  // 直接写 uniform 值：ratio 变化必然来自 useTrait 触发的重渲染，无需重建材质
  uniforms.uRatio.value = ratio

  return (
    <mesh
      position={[pos.x, pos.y + yOffset, pos.z]}
      rotation={[-Math.PI / 2, 0, 0]}
      raycast={() => null}
    >
      <circleGeometry args={[radius, 48]} />
      <shaderMaterial
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}
