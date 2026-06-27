import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { AdditiveBlending, BackSide, type BufferAttribute, Color, type Group, type InstancedMesh, type LineSegments, Object3D, type PerspectiveCamera, type ShaderMaterial, Vector3 } from 'three'
import { Html, OrbitControls } from '@react-three/drei'
import type { GlobeEdge, GlobeLayout, GlobeNode } from '../../../lib/globe-layout'
import type { DataStatus, NodeStatus } from '../../../lib/types'
import { GLOBE } from './globe-consts'
import { sufficiencyColor } from '../../../lib/format'
import type { GlobeColors } from './useGlobeColors'

// THE unified research renderer. The flat constellation and the globe are two MORPH STATES of the same
// nodes/edges/labels: a single `morph` value (0 = flat columns in the z=0 plane, 1 = sphere) lerps every
// position, and a camera dolly/zoom flattens the perspective at 0 so the flat state reads as a clean 2D
// constellation. Toggling animates `morph` — one continuous wrap/unwrap, no renderer swap, no breaks.

const MORPH_DUR = 1.7 // seconds for the wrap / unwrap — slow enough to enjoy, fast enough to read in the crossfade
const FLAT_CAM = new Vector3(0, 0, 64)
const SPHERE_CAM = new Vector3(0, 2.5, 27)
const FLAT_FOV = 20 // narrow + far ≈ orthographic → the flat constellation looks 2D
const SPHERE_FOV = 45
const TMP_OBJ = new Object3D()
const TMP_A = new Vector3()
const TMP_B = new Vector3()

const v3 = (p: { x: number; y: number; z: number }) => new Vector3(p.x, p.y, p.z)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function nodeColor(status: NodeStatus, isSynthesis: boolean, c: GlobeColors): Color {
  switch (status) {
    case 'done': return c.accent
    case 'running': return c.accentBright
    case 'queued': return c.accentDeep
    case 'failed': return c.bad
    case 'ready': return c.accentDeep
    default: return isSynthesis ? c.hairline.clone().lerp(c.accent, 0.45) : c.faint
  }
}

// surface-hugging great-circle arc between two shell points (never enters the interior)
function arcPoints(from: V3In, to: V3In, bow: number, segs: number): Vector3[] {
  const a = v3(from)
  const b = v3(to)
  const ra = a.length() || 1
  const rb = b.length() || 1
  const da = a.clone().normalize()
  const db = b.clone().normalize()
  const omega = Math.acos(Math.max(-1, Math.min(1, da.dot(db))))
  const sinO = Math.sin(omega)
  const out: Vector3[] = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const dir = sinO < 1e-4 ? da.clone() : da.clone().multiplyScalar(Math.sin((1 - t) * omega) / sinO).add(db.clone().multiplyScalar(Math.sin(t * omega) / sinO))
    out.push(dir.normalize().multiplyScalar(ra + (rb - ra) * t + bow * Math.sin(Math.PI * t)))
  }
  return out
}
type V3In = { x: number; y: number; z: number }

function flatLine(from: V3In, to: V3In, segs: number): Vector3[] {
  const a = v3(from), b = v3(to)
  const out: Vector3[] = []
  for (let i = 0; i <= segs; i++) out.push(a.clone().lerp(b, i / segs))
  return out
}

function edgeBow(e: GlobeEdge): number {
  const chord = Math.hypot(e.to.x - e.from.x, e.to.y - e.from.y, e.to.z - e.from.z)
  if (e.kind === 'feeds') return 0.25
  if (e.kind === 'core') return 0.4 + 0.06 * chord
  return 0.6 + 0.1 * chord
}

// ---- morphing, flowing, dashed edge set (one draw call) ----
// Each edge is sampled into K points in BOTH the flat plane and the sphere arc; positions lerp by `morph`.
// A dash shader marches dashes along each edge by `uTime` — the 3D analog of the constellation's edge-flow.
const EDGE_VERT = 'attribute float aT; varying float vT; void main(){ vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
const EDGE_FRAG = 'uniform vec3 uColor; uniform float uTime; uniform float uDashes; uniform float uDuty; uniform float uOpacity; uniform float uSpeed; varying float vT; void main(){ float f = fract(vT * uDashes - uTime * uSpeed); if (f > uDuty) discard; gl_FragColor = vec4(uColor, uOpacity); }'
const K_SEG = 26 // samples per edge

function MorphEdges({ edges, color, opacity, speed, morphRef }: { edges: GlobeEdge[]; color: Color; opacity: number; speed: number; morphRef: { current: number }; }) {
  const ref = useRef<LineSegments>(null)
  // precompute flat + sphere vertex arrays (segment pairs) and the dash param per vertex
  const { positions, aT, flatV, sphereV, count } = useMemo(() => {
    const flatPts: Vector3[][] = edges.map((e) => flatLine(e.flatFrom, e.flatTo, K_SEG))
    const sphPts: Vector3[][] = edges.map((e) => arcPoints(e.from, e.to, edgeBow(e), K_SEG))
    const segsPerEdge = K_SEG // (K_SEG+1 points → K_SEG segments)
    const verts = edges.length * segsPerEdge * 2
    const positions = new Float32Array(verts * 3)
    const aT = new Float32Array(verts)
    const flatV = new Float32Array(verts * 3)
    const sphereV = new Float32Array(verts * 3)
    let o = 0
    edges.forEach((_e, ei) => {
      const fp = flatPts[ei], sp = sphPts[ei]
      for (let s = 0; s < segsPerEdge; s++) {
        for (const idx of [s, s + 1]) {
          flatV[o * 3] = fp[idx].x; flatV[o * 3 + 1] = fp[idx].y; flatV[o * 3 + 2] = fp[idx].z
          sphereV[o * 3] = sp[idx].x; sphereV[o * 3 + 1] = sp[idx].y; sphereV[o * 3 + 2] = sp[idx].z
          aT[o] = idx / segsPerEdge
          o++
        }
      }
    })
    return { positions, aT, flatV, sphereV, count: verts }
  }, [edges])

  useFrame((state) => {
    const ls = ref.current
    if (!ls) return
    const mat = ls.material as ShaderMaterial
    mat.uniforms.uTime.value = state.clock.elapsedTime
    const e = easeInOut(morphRef.current)
    const posAttr = ls.geometry.attributes.position as BufferAttribute
    const arr = posAttr.array as Float32Array
    for (let i = 0; i < arr.length; i++) arr[i] = flatV[i] + (sphereV[i] - flatV[i]) * e
    posAttr.needsUpdate = true
  })

  const uniforms = useMemo(() => ({ uColor: { value: color.clone() }, uTime: { value: 0 }, uDashes: { value: 16 }, uDuty: { value: 0.5 }, uOpacity: { value: opacity }, uSpeed: { value: speed } }), []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { (uniforms.uColor.value as Color).copy(color); uniforms.uOpacity.value = opacity; uniforms.uSpeed.value = speed }, [color, opacity, speed, uniforms])

  if (!edges.length) return null
  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
        <bufferAttribute attach="attributes-aT" args={[aT, 1]} count={count} />
      </bufferGeometry>
      <shaderMaterial vertexShader={EDGE_VERT} fragmentShader={EDGE_FRAG} uniforms={uniforms} transparent depthWrite={false} />
    </lineSegments>
  )
}

// fresnel atmosphere rim so the globe reads as a lit sphere (esp. dark mode); fades out as it flattens
const ATMO_VERT = 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
const ATMO_FRAG = 'uniform vec3 uColor; uniform float uM; varying vec3 vN; void main(){ float i = clamp(pow(0.55 - dot(vN, vec3(0.0,0.0,1.0)), 4.2), 0.0, 1.0); gl_FragColor = vec4(uColor * i, i * 0.55 * uM); }'

export function GlobeScene({
  layout,
  nodeStatus,
  colors,
  reducedMotion,
  morphTarget,
  dataStatus,
  hoverKey,
  onHover,
  onPick,
  onCoreClick,
  onClusterClick,
}: {
  layout: GlobeLayout
  nodeStatus: (key: string) => NodeStatus
  colors: GlobeColors
  reducedMotion: boolean
  morphTarget: number // 0 = flat constellation, 1 = sphere
  dataStatus: DataStatus | null
  hoverKey: string | null
  onHover: (n: GlobeNode | null, clientX: number, clientY: number) => void
  onPick: (n: GlobeNode, clientX: number, clientY: number) => void
  onCoreClick: () => void
  onClusterClick: (module: string) => void
}) {
  const nodes = layout.nodes
  const statusSig = nodes.map((n) => nodeStatus(n.key)).join('')
  const meshRef = useRef<InstancedMesh>(null)
  const bodyRef = useRef<Group>(null) // sphere shell (occluder + grid + atmosphere) — fades/scales with morph
  const labelRefs = useRef<Group[]>([])
  const coreRef = useRef<Group>(null)
  const atmoMat = useRef<ShaderMaterial>(null)
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()

  // ---- morph driver state ----
  // Two-renderer mode: the globe MOUNTS when you switch to it, so it always begins FLAT (morph 0) and wraps
  // in to the sphere — the visual rhyme with the constellation that just dissolved. On exit (morphTarget→0,
  // while AnimatePresence holds it mounted) it unwraps back toward flat. Reduced-motion snaps to the target.
  const morphRef = useRef(reducedMotion ? morphTarget : 0) // current eased-input 0..1
  const targetRef = useRef(reducedMotion ? morphTarget : 0)
  const startT = useRef<number | null>(null)
  const startVal = useRef(morphRef.current)
  const camStart = useRef(new Vector3())
  const fovStart = useRef(SPHERE_FOV)

  // position the camera correctly for the initial state on mount (no animation on first load)
  useEffect(() => {
    const cam = camera as PerspectiveCamera
    const at1 = morphRef.current >= 0.5
    cam.position.copy(at1 ? SPHERE_CAM : FLAT_CAM)
    cam.fov = at1 ? SPHERE_FOV : FLAT_FOV
    cam.lookAt(0, 0, 0)
    cam.updateProjectionMatrix()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // instance COLORS (cheap; only on status / theme / hover change)
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    nodes.forEach((n, i) => mesh.setColorAt(i, nodeColor(nodeStatus(n.key), n.isSynthesis, colors)))
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, colors, statusSig])

  // live pulse indices
  const statuses = useMemo(() => nodes.map((n) => nodeStatus(n.key)), [nodes, statusSig]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- active edges (data flowing) ----
  const moduleDone = useMemo(() => {
    const s = new Set<string>()
    for (const a of layout.moduleAnchors) if (a.synthKey && nodeStatus(a.synthKey) === 'done') s.add(a.module)
    return s
  }, [layout.moduleAnchors, statusSig]) // eslint-disable-line react-hooks/exhaustive-deps
  const activeMods = useMemo(() => new Set(nodes.filter((_n, i) => statuses[i] === 'running' || statuses[i] === 'queued').map((n) => n.module)), [nodes, statuses])
  const depCoreEdges = useMemo(() => layout.edges.filter((e) => e.kind !== 'feeds'), [layout.edges])
  const activeEdges = useMemo(
    () => depCoreEdges.filter((e) => (e.kind === 'dep' && moduleDone.has(e.fromModule) && activeMods.has(e.toModule)) || (e.kind === 'core' && moduleDone.has(e.fromModule))),
    [depCoreEdges, moduleDone, activeMods],
  )

  // ---- the driver: advance morph, then lerp nodes / labels / core / camera / controls ----
  useFrame((state) => {
    const cam = camera as PerspectiveCamera
    // advance morph (time-based → exact duration; reduced-motion snaps)
    if (targetRef.current !== morphTarget) {
      targetRef.current = morphTarget
      startT.current = state.clock.elapsedTime
      startVal.current = morphRef.current
      camStart.current.copy(cam.position)
      fovStart.current = cam.fov
    }
    if (reducedMotion) morphRef.current = morphTarget
    else if (morphRef.current !== morphTarget) {
      const p = Math.min(1, (state.clock.elapsedTime - (startT.current ?? state.clock.elapsedTime)) / MORPH_DUR)
      morphRef.current = startVal.current + (morphTarget - startVal.current) * p
      if (p >= 1) morphRef.current = morphTarget
    }
    const m = morphRef.current
    const e = easeInOut(m)
    const t = state.clock.elapsedTime

    // nodes: lerp flat↔sphere + live pulse
    const mesh = meshRef.current
    if (mesh) {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        TMP_A.set(n.flatPos.x, n.flatPos.y, n.flatPos.z)
        TMP_B.set(n.pos.x, n.pos.y, n.pos.z)
        TMP_A.lerp(TMP_B, e)
        let s = n.r * (hoverKey === n.key ? 1.5 : 1)
        const st = statuses[i]
        if (st === 'running' || st === 'queued') {
          const period = st === 'running' ? 1.3 : 1.7
          const amp = st === 'running' ? 0.3 : 0.16
          s *= 1 + amp * (0.5 + 0.5 * Math.sin((t * 2 * Math.PI) / period))
        }
        TMP_OBJ.position.copy(TMP_A)
        TMP_OBJ.scale.setScalar(s)
        TMP_OBJ.updateMatrix()
        mesh.setMatrixAt(i, TMP_OBJ.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    }

    // labels: lerp flat (above column) ↔ sphere (lifted patch center)
    layout.moduleAnchors.forEach((a, i) => {
      const g = labelRefs.current[i]
      if (!g) return
      g.position.set(lerp(a.flatLabel.x, a.center.x * 1.06, e), lerp(a.flatLabel.y, a.center.y * 1.06, e), lerp(a.flatLabel.z, a.center.z * 1.06, e))
    })
    // core
    if (coreRef.current) coreRef.current.position.set(lerp(layout.core.flatPos.x, layout.core.pos.x, e), lerp(layout.core.flatPos.y, layout.core.pos.y, e), lerp(layout.core.flatPos.z, layout.core.pos.z, e))

    // sphere shell only exists near the sphere state: fade + scale in as it wraps
    if (bodyRef.current) {
      const shell = Math.max(0, (e - 0.35) / 0.65) // 0 until 35% wrapped, 1 at sphere
      bodyRef.current.scale.setScalar(0.0001 + shell)
      bodyRef.current.visible = shell > 0.01
    }
    if (atmoMat.current) atmoMat.current.uniforms.uM.value = Math.max(0, (e - 0.5) / 0.5)

    // camera: drive during the morph (flatten perspective at 0); hand to OrbitControls at the sphere
    const settledSphere = m >= 0.999 && morphTarget === 1
    if (controlsRef.current) {
      controlsRef.current.enabled = settledSphere
      controlsRef.current.autoRotate = settledSphere && !reducedMotion
    }
    if (!settledSphere) {
      const p = startT.current == null ? 1 : Math.min(1, (state.clock.elapsedTime - startT.current) / MORPH_DUR)
      const targetCam = morphTarget === 1 ? SPHERE_CAM : FLAT_CAM
      const targetFov = morphTarget === 1 ? SPHERE_FOV : FLAT_FOV
      cam.position.lerpVectors(camStart.current, targetCam, reducedMotion ? 1 : easeInOut(p))
      cam.fov = lerp(fovStart.current, targetFov, reducedMotion ? 1 : easeInOut(p))
      cam.lookAt(0, 0, 0)
      cam.updateProjectionMatrix()
    }
  })

  const ev = ( x: any): [number, number] => {
    const n = x.nativeEvent as PointerEvent
    return [n.clientX, n.clientY]
  }

  return (
    <>
      <fogExp2 attach="fog" args={[colors.bg.getHex(), 0.016]} />
      <ambientLight intensity={1} />
      <OrbitControls ref={controlsRef} makeDefault enabled={false} enablePan={false} enableDamping dampingFactor={0.08} rotateSpeed={0.6} zoomSpeed={0.6} minDistance={16} maxDistance={44} autoRotateSpeed={0.35} />

      {/* sphere shell — only present near the globe state (scales/fades in as it wraps) */}
      <group ref={bodyRef}>
        <mesh>
          <sphereGeometry args={[GLOBE.R * 0.99, 48, 48]} />
          <meshBasicMaterial color={colors.bg.clone().lerp(colors.hairline, 0.55)} />
        </mesh>
        <mesh>
          <sphereGeometry args={[GLOBE.R, 32, 20]} />
          <meshBasicMaterial color={colors.hairline.clone().lerp(colors.accentDeep, 0.6)} wireframe transparent opacity={0.22} />
        </mesh>
        <mesh scale={1.04}>
          <sphereGeometry args={[GLOBE.R, 48, 48]} />
          <shaderMaterial ref={atmoMat} uniforms={useMemo(() => ({ uColor: { value: colors.accent.clone() }, uM: { value: 1 } }), [])} vertexShader={ATMO_VERT} fragmentShader={ATMO_FRAG} transparent depthWrite={false} blending={AdditiveBlending} side={BackSide} />
        </mesh>
      </group>

      {/* edges — morphing, flowing, dashed (dep+core always; a brighter set for active data-flow) */}
      <MorphEdges edges={depCoreEdges} color={colors.accentDeep} opacity={0.5} speed={0.14} morphRef={morphRef} />
      {activeEdges.length > 0 && <MorphEdges edges={activeEdges} color={colors.accentBright} opacity={0.95} speed={0.4} morphRef={morphRef} />}

      {/* agent orbs — one instanced draw call; positions/scale driven per-frame in the driver */}
      <instancedMesh
        ref={meshRef}
        args={[undefined as any, undefined as any, nodes.length]}
        onPointerMove={(x) => { x.stopPropagation(); if (x.instanceId != null) { const [cx, cy] = ev(x); onHover(nodes[x.instanceId], cx, cy) } }}
        onPointerOut={() => onHover(null, 0, 0)}
        onClick={(x) => { x.stopPropagation(); if (x.instanceId != null) { const [cx, cy] = ev(x); onPick(nodes[x.instanceId], cx, cy) } }}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* Memo core */}
      <group ref={coreRef}>
        <mesh onClick={(x) => { x.stopPropagation(); onCoreClick() }}>
          <sphereGeometry args={[layout.core.r, 24, 24]} />
          <meshBasicMaterial color={colors.accent} toneMapped={false} />
        </mesh>
      </group>

      {/* module labels — name + status + "run module"; morph position flat(above column) ↔ sphere(patch) */}
      {layout.moduleAnchors.map((a, i) => {
        const ms = dataStatus?.modules[a.module]?.status
        return (
          <group key={a.module} ref={(el) => { if (el) labelRefs.current[i] = el }}>
            <Html center distanceFactor={26} occlude zIndexRange={[12, 0]}>
              <div className="globelabel" onClick={(ev2) => { ev2.stopPropagation(); onClusterClick(a.module) }}>
                <div className="globelabel__name">{a.module.replace(/-/g, ' ')}</div>
                {ms && <div className="globelabel__status" style={{ color: sufficiencyColor(ms) }}>{ms}</div>}
                <div className="globelabel__run">▸ run module</div>
              </div>
            </Html>
          </group>
        )
      })}
    </>
  )
}
