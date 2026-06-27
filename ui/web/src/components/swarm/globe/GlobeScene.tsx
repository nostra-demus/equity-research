import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BackSide, type BufferAttribute, CatmullRomCurve3, Color, type Group, type InstancedMesh, Object3D, type Points, type ShaderMaterial, Vector3 } from 'three'
import { Html, Line, OrbitControls } from '@react-three/drei'
import type { GlobeEdge, GlobeLayout, GlobeNode } from '../../../lib/globe-layout'
import type { NodeStatus } from '../../../lib/types'
import { GLOBE } from './globe-consts'
import type { GlobeColors } from './useGlobeColors'

// Everything INSIDE the <Canvas>: the sphere shell + occluder, instanced agent orbs, dependency/feed/core
// edges as depth-correct bezier arcs, module-name billboards, the Memo core, and grab-to-rotate controls.
// A second renderer of the same swarm state — node colors come from the shared nodeStatus resolver, so the
// globe reads the same statuses as the flat view. (The full live status grammar + data-flow is PR4.)

const v3 = (p: { x: number; y: number; z: number }) => new Vector3(p.x, p.y, p.z)

// PR2: a calm static status tint (done = accent, running = bright, failed = red, else dim). PR4 replaces
// this with the animated emissive/pulse grammar driven by orbProgress.
function nodeColor(status: NodeStatus, isSynthesis: boolean, c: GlobeColors): Color {
  switch (status) {
    case 'done': return c.accent
    case 'running': return c.accentBright
    case 'queued': return c.accentDeep
    case 'failed': return c.bad
    case 'ready': return c.accentDeep
    default: return isSynthesis ? c.hairline.clone().lerp(c.accent, 0.4) : c.faint
  }
}

// How high an edge lifts off the surface at its midpoint (world units). Longer cross-globe deps bow more.
function edgeBow(e: GlobeEdge): number {
  const dx = e.to.x - e.from.x, dy = e.to.y - e.from.y, dz = e.to.z - e.from.z
  const chord = Math.hypot(dx, dy, dz)
  if (e.kind === 'feeds') return 0.25
  if (e.kind === 'core') return 0.4 + 0.06 * chord
  return 0.6 + 0.1 * chord
}

// A surface-hugging arc between two shell points: SLERP the direction (great circle) and lift the radius
// in the middle (a flight-path bow). Because every sampled point sits at radius >= the endpoints' radius,
// the line can NEVER pass through the globe interior — it rides on/above the surface like a route on Earth.
function arcPoints(from: { x: number; y: number; z: number }, to: { x: number; y: number; z: number }, bow: number, segs: number): Vector3[] {
  const a = v3(from)
  const b = v3(to)
  const ra = a.length() || 1
  const rb = b.length() || 1
  const da = a.clone().normalize()
  const db = b.clone().normalize()
  const omega = Math.acos(Math.max(-1, Math.min(1, da.dot(db))))
  const sinO = Math.sin(omega)
  const pts: Vector3[] = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const dir =
      sinO < 1e-4
        ? da.clone()
        : da.clone().multiplyScalar(Math.sin((1 - t) * omega) / sinO).add(db.clone().multiplyScalar(Math.sin(t * omega) / sinO))
    const r = ra + (rb - ra) * t + bow * Math.sin(Math.PI * t) // endpoint radii + a midpoint lift
    pts.push(dir.normalize().multiplyScalar(r))
  }
  return pts
}

function edgePoints(e: GlobeEdge): Vector3[] {
  return arcPoints(e.from, e.to, edgeBow(e), e.kind === 'feeds' ? 16 : 30)
}

// Light pulses travelling each ACTIVE edge toward its target — the 3D analog of the flat view's flowing
// dashes. One additive Points draw call for all pulses across all active edges; positions are advanced
// along the precomputed bezier each frame by the render clock. Fog dims the far-side pulses for free.
const FLOW_TMP = new Vector3()
const TMP_OBJ = new Object3D()
function DataFlow({ curves, color }: { curves: CatmullRomCurve3[]; color: Color }) {
  const K = 5 // pulses per edge
  const count = curves.length * K
  const ref = useRef<Points>(null)
  const positions = useMemo(() => new Float32Array(Math.max(1, count) * 3), [count])
  useFrame((state) => {
    const pts = ref.current
    if (!pts || !curves.length) return
    const t = state.clock.elapsedTime
    const attr = pts.geometry.attributes.position as BufferAttribute
    const arr = attr.array as Float32Array
    for (let ci = 0; ci < curves.length; ci++) {
      for (let k = 0; k < K; k++) {
        const phase = (t * 0.22 + k / K + ci * 0.13) % 1 // travels from→to, staggered per pulse/edge
        curves[ci].getPoint(phase, FLOW_TMP)
        const idx = (ci * K + k) * 3
        arr[idx] = FLOW_TMP.x
        arr[idx + 1] = FLOW_TMP.y
        arr[idx + 2] = FLOW_TMP.z
      }
    }
    attr.needsUpdate = true
  })
  if (!curves.length) return null
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.5} sizeAttenuation transparent opacity={0.95} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
    </points>
  )
}

// A dependency/core/feeds arc rendered as a dashed line whose dashes MARCH toward the target — the 3D
// analog of the constellation's .edge--flow. Every visible globe edge flows, giving the whole web motion.
function FlowLine({ points, color, opacity, width, speed = 1.4 }: { points: Vector3[]; color: Color; opacity: number; width: number; speed?: number }) {
  const ref = useRef<any>(null)
  useFrame((_, delta) => {
    const m = ref.current?.material
    if (m) m.dashOffset -= delta * speed // negative offset = dashes travel toward the line's end (the target)
  })
  return <Line ref={ref} points={points} color={color} lineWidth={width} transparent opacity={opacity} dashed dashSize={0.32} gapSize={0.26} />
}

// Soft fresnel atmosphere rim so the globe READS as a lit sphere in dark mode (the classic Earth-glow
// shader: a slightly larger back-side sphere, additive, brightest at the silhouette). Recolors with theme.
const ATMO_VERT = 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
const ATMO_FRAG = 'uniform vec3 uColor; varying vec3 vN; void main(){ float i = clamp(pow(0.55 - dot(vN, vec3(0.0, 0.0, 1.0)), 4.2), 0.0, 1.0); gl_FragColor = vec4(uColor * i, i * 0.55); }'
function Atmosphere({ color }: { color: Color }) {
  const mat = useRef<ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uColor: { value: color.clone() } }), []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const m = mat.current; if (m) (m.uniforms.uColor.value as Color).copy(color) }, [color])
  return (
    <mesh scale={1.04}>
      <sphereGeometry args={[GLOBE.R, 48, 48]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={ATMO_VERT} fragmentShader={ATMO_FRAG} transparent depthWrite={false} blending={AdditiveBlending} side={BackSide} />
    </mesh>
  )
}

export function GlobeScene({
  layout,
  nodeStatus,
  colors,
  reducedMotion,
  exiting,
  onExitComplete,
  hoverKey,
  onHover,
  onPick,
  onCoreClick,
}: {
  layout: GlobeLayout
  nodeStatus: (key: string) => NodeStatus
  colors: GlobeColors
  reducedMotion: boolean
  exiting: boolean
  onExitComplete: () => void
  hoverKey: string | null
  onHover: (n: GlobeNode | null, clientX: number, clientY: number) => void
  onPick: (n: GlobeNode, clientX: number, clientY: number) => void
  onCoreClick: () => void
}) {
  const meshRef = useRef<InstancedMesh>(null)
  const nodes = layout.nodes

  // a status signature so the instance colors refresh when any node's status changes
  const statusSig = nodes.map((n) => nodeStatus(n.key)).join('')

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const dummy = new Object3D()
    nodes.forEach((n, i) => {
      dummy.position.set(n.pos.x, n.pos.y, n.pos.z)
      dummy.scale.setScalar(n.r * (hoverKey === n.key ? 1.5 : 1))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, nodeColor(nodeStatus(n.key), n.isSynthesis, colors))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, colors, statusSig, hoverKey])

  // The flat↔sphere "wrap" morph. The whole globe starts squashed almost flat (a disc facing the camera)
  // and slowly inflates to a full sphere (~1.6s) — the "system wrapping into a globe" read — and on exit
  // deflates back to flat before handing control to the constellation (the unwrap). Animating the content
  // group's scale.z (with a slight x/y overshoot), eased both ways, so nodes/arcs/core wrap together with
  // zero per-frame geometry rebuild. Skipped under reduced-motion (mounts/leaves instantly).
  const MORPH_DUR = 2.6 // seconds each way — a slow, luxurious wrap/unwrap you can watch
  const groupRef = useRef<Group>(null)
  const morph = useRef(reducedMotion ? 1 : 0)
  const startT = useRef<number | null>(null) // absolute render-clock time the current morph began
  const startVal = useRef(morph.current)
  const exitDone = useRef(false)
  useEffect(() => { startT.current = null }, [exiting]) // new direction → recapture start time + value
  useFrame((state) => {
    const g = groupRef.current
    if (!g) return
    const target = exiting ? 0 : 1
    const setScale = (m: number) => {
      const e = m < 0.5 ? 4 * m * m * m : 1 - Math.pow(-2 * m + 2, 3) / 2 // easeInOutCubic — smooth both ways
      const lp = (a: number, b: number) => a + (b - a) * e
      g.scale.set(lp(1.18, 1), lp(1.18, 1), lp(0.04, 1))
    }
    if (morph.current === target) {
      setScale(target)
      if (exiting && !exitDone.current) { exitDone.current = true; onExitComplete() }
      return
    }
    if (startT.current === null) { startT.current = state.clock.elapsedTime; startVal.current = morph.current }
    // time-based progress → exactly MORPH_DUR seconds regardless of frame rate (delta accumulation drifted)
    const p = Math.min(1, (state.clock.elapsedTime - startT.current) / MORPH_DUR)
    morph.current = startVal.current + (target - startVal.current) * p
    setScale(morph.current)
    if (p >= 1) {
      morph.current = target
      if (exiting && !exitDone.current) { exitDone.current = true; onExitComplete() }
    }
  })

  // ---- live status grammar: smooth scale pulse on queued/running orbs (render clock, not the 1s tick) ----
  const statuses = useMemo(() => nodes.map((n) => nodeStatus(n.key)), [nodes, statusSig]) // eslint-disable-line react-hooks/exhaustive-deps
  const liveIdx = useMemo(() => statuses.map((s, i) => (s === 'running' || s === 'queued' ? i : -1)).filter((i) => i >= 0), [statuses])
  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh || !liveIdx.length) return
    const t = state.clock.elapsedTime
    for (const i of liveIdx) {
      const n = nodes[i]
      const running = statuses[i] === 'running'
      const period = running ? 1.3 : 1.7 // running feels urgent, queued feels like waiting (matches the CSS)
      const amp = running ? 0.3 : 0.16
      const s = n.r * (1 + amp * (0.5 + 0.5 * Math.sin((t * 2 * Math.PI) / period)))
      TMP_OBJ.position.set(n.pos.x, n.pos.y, n.pos.z)
      TMP_OBJ.scale.setScalar(s)
      TMP_OBJ.updateMatrix()
      mesh.setMatrixAt(i, TMP_OBJ.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  // ---- active edges (data flowing): upstream module done feeding a live downstream / the Memo ----
  const moduleDone = useMemo(() => {
    const s = new Set<string>()
    for (const a of layout.moduleAnchors) if (a.synthKey && nodeStatus(a.synthKey) === 'done') s.add(a.module)
    return s
  }, [layout.moduleAnchors, statusSig]) // eslint-disable-line react-hooks/exhaustive-deps
  const activeMods = useMemo(() => new Set(nodes.filter((n, i) => statuses[i] === 'running' || statuses[i] === 'queued').map((n) => n.module)), [nodes, statuses])
  const activeCurves = useMemo(() => {
    const out: CatmullRomCurve3[] = []
    for (const e of layout.edges) {
      if (e.kind === 'feeds') continue
      const flow = (e.kind === 'dep' && moduleDone.has(e.fromModule) && activeMods.has(e.toModule)) || (e.kind === 'core' && moduleDone.has(e.fromModule))
      if (flow) out.push(new CatmullRomCurve3(arcPoints(e.from, e.to, edgeBow(e), 30))) // same surface-hugging arc
    }
    return out
  }, [layout.edges, moduleDone, activeMods])

  // dependency + core arcs always show (faint); feeds stay hidden until hover (like the flat EdgeLayer)
  const visibleEdges = useMemo(
    () => layout.edges.filter((e) => e.kind !== 'feeds' || (hoverKey && (e.fromKey === hoverKey || e.toKey === hoverKey))),
    [layout.edges, hoverKey],
  )

  const ev = (e: any): [number, number] => {
    const n = e.nativeEvent as PointerEvent
    return [n.clientX, n.clientY]
  }

  return (
    <>
      <fogExp2 attach="fog" args={[colors.bg.getHex(), 0.018]} />
      <ambientLight intensity={1} />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        zoomSpeed={0.6}
        minDistance={15}
        maxDistance={42}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.4}
      />

      <group ref={groupRef} scale={reducedMotion ? 1 : [1.18, 1.18, 0.04]}>
      {/* soft fresnel atmosphere rim — makes the globe read as a lit sphere, especially in dark mode */}
      <Atmosphere color={colors.accent} />
      {/* body sphere: a tinted dark orb lifted off the page bg, which ALSO occludes far-side arcs/nodes */}
      <mesh>
        <sphereGeometry args={[GLOBE.R * 0.99, 48, 48]} />
        <meshBasicMaterial color={colors.bg.clone().lerp(colors.hairline, 0.55)} />
      </mesh>
      {/* lat/long grid — a warm, clearly-visible wireframe so the volume reads as a globe */}
      <mesh>
        <sphereGeometry args={[GLOBE.R, 32, 20]} />
        <meshBasicMaterial color={colors.hairline.clone().lerp(colors.accentDeep, 0.6)} wireframe transparent opacity={0.22} />
      </mesh>

      {/* edges — every arc FLOWS (dashes march toward the target), the 3D analog of .edge--flow */}
      {visibleEdges.map((e) => {
        const lit = hoverKey != null && (e.fromKey === hoverKey || e.toKey === hoverKey)
        return (
          <FlowLine
            key={e.id}
            points={edgePoints(e)}
            color={lit ? colors.accentBright : colors.accentDeep}
            width={lit ? 2 : 1.1}
            opacity={lit ? 0.95 : e.kind === 'core' ? 0.6 : 0.42}
            speed={lit ? 2.4 : 1.4}
          />
        )
      })}

      {/* agent orbs — one instanced draw call */}
      <instancedMesh
        ref={meshRef}
        args={[undefined as any, undefined as any, nodes.length]}
        onPointerMove={(e) => {
          e.stopPropagation()
          if (e.instanceId != null) { const [x, y] = ev(e); onHover(nodes[e.instanceId], x, y) }
        }}
        onPointerOut={() => onHover(null, 0, 0)}
        onClick={(e) => {
          e.stopPropagation()
          if (e.instanceId != null) { const [x, y] = ev(e); onPick(nodes[e.instanceId], x, y) }
        }}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* Memo core at the south pole */}
      <mesh position={[layout.core.pos.x, layout.core.pos.y, layout.core.pos.z]} onClick={(e) => { e.stopPropagation(); onCoreClick() }}>
        <sphereGeometry args={[layout.core.r, 24, 24]} />
        <meshBasicMaterial color={colors.accent} toneMapped={false} />
      </mesh>

      {/* module-name billboards — only the front-facing ones (occlude hides the back) */}
      {layout.moduleAnchors.map((a) => (
        <Html
          key={a.module}
          position={[a.center.x * 1.06, a.center.y * 1.06, a.center.z * 1.06]}
          center
          distanceFactor={30}
          occlude
          zIndexRange={[10, 0]}
        >
          <div className="globelabel">{a.module.replace(/-/g, ' ')}</div>
        </Html>
      ))}

      {/* data-flow pulses along the edges that are actively carrying results during a run */}
      <DataFlow curves={activeCurves} color={colors.accentBright} />
      </group>
    </>
  )
}
