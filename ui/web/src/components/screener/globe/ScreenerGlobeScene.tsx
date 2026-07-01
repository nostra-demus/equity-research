import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BackSide, type Group, type Mesh, type ShaderMaterial } from 'three'
import { Html, OrbitControls } from '@react-three/drei'
import { SCREENER_GLOBE, type GlobeMarker } from '../../../lib/screener-globe-layout'
import type { GlobeColors } from '../../swarm/globe/useGlobeColors'

// A FRESH scene — written by inspection of GlobeScene.tsx's visual conventions (stylized, non-photorealistic
// glow aesthetic; camera-facing DOM billboards for hit-testing; a fresnel atmosphere rim), not forked from
// it. Unlike the research globe (agent/module orbs on an abstract Fibonacci sphere), this one is a real
// geography globe: a stylized wireframe/graticule shell (no binary texture asset — a plain lat/lon line
// grid drawn with a shader, same "no textures" doctrine as GlobeScene's continent shader) plus one glowing
// marker per country aggregate, sized/coloured by count and materiality score.
//
// Click/hover reuse GlobeScene's approach exactly: markers are drei <Html> DOM elements billboarded at a
// 3D position (occluding against the shell), so hit-testing is ordinary DOM events — never a raw
// THREE.Raycaster — which is what "the same raycasting approach GlobeScene.tsx already uses" means in
// practice (see GlobeScene.tsx's own AgentNode <Html> block).

// a soft lat/lon graticule painted on the shell — same "no texture asset" doctrine as GlobeScene's CONT_FRAG
const GRID_VERT = 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
const GRID_FRAG = [
  'uniform vec3 uOcean; uniform vec3 uLine;',
  'varying vec3 vDir;',
  'void main(){',
  '  vec3 d = normalize(vDir);',
  '  float lat = asin(clamp(d.y, -1.0, 1.0));', // -PI/2..PI/2
  '  float lon = atan(d.x, d.z);', // -PI..PI
  '  float latLine = abs(fract(lat / 0.5236 + 0.5) - 0.5) * 2.0;', // every 30deg
  '  float lonLine = abs(fract(lon / 0.5236 + 0.5) - 0.5) * 2.0;',
  '  float g = 1.0 - min(smoothstep(0.0, 0.05, latLine), smoothstep(0.0, 0.05, lonLine));',
  '  vec3 col = mix(uOcean, uLine, g * 0.55);',
  '  gl_FragColor = vec4(col, 1.0);',
  '}',
].join('\n')

// fresnel atmosphere rim — identical doctrine to GlobeScene's ATMO shader (a lit-sphere read in dark mode)
const ATMO_VERT = 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
const ATMO_FRAG = 'uniform vec3 uColor; varying vec3 vN; void main(){ float i = clamp(pow(0.55 - dot(vN, vec3(0.0,0.0,1.0)), 4.2), 0.0, 1.0); gl_FragColor = vec4(uColor * i, i * 0.55); }'

export function ScreenerGlobeScene({
  markers,
  colors,
  reducedMotion,
  selectedCountry,
  hoverCountry,
  onHover,
  onSelect,
}: {
  markers: GlobeMarker[]
  colors: GlobeColors
  reducedMotion: boolean
  selectedCountry: string | null
  hoverCountry: string | null
  onHover: (cc: string | null) => void
  onSelect: (cc: string) => void
}) {
  const bodyRef = useRef<Group>(null)
  const shellRef = useRef<Mesh>(null!)

  const gridUniforms = useMemo(() => ({ uOcean: { value: colors.bg.clone() }, uLine: { value: colors.hairline.clone() } }), []) // eslint-disable-line react-hooks/exhaustive-deps
  const atmoUniforms = useMemo(() => ({ uColor: { value: colors.accent.clone() } }), []) // eslint-disable-line react-hooks/exhaustive-deps

  // colors update in place (theme/swarm token flips) rather than recreating the material, so nothing flashes
  useMemo(() => {
    gridUniforms.uOcean.value.copy(colors.bg).lerp(colors.hairline, 0.35)
    gridUniforms.uLine.value.copy(colors.accentDeep)
    atmoUniforms.uColor.value.copy(colors.accent)
  }, [colors, gridUniforms, atmoUniforms])

  // slow idle auto-rotate, paused on hover/selection and disabled under prefers-reduced-motion (plan §
  // "slow idle auto-rotate paused on interaction / disabled under prefers-reduced-motion")
  useFrame((_state, delta) => {
    if (reducedMotion || hoverCountry || selectedCountry) return
    if (bodyRef.current) bodyRef.current.rotation.y += delta * 0.035
  })

  return (
    <>
      <fogExp2 attach="fog" args={[colors.bg.getHex(), 0.014]} />
      <ambientLight intensity={1} />
      <OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={0.08} rotateSpeed={0.55} zoomSpeed={0.6} minDistance={16} maxDistance={40} />

      <group ref={bodyRef}>
        <mesh ref={shellRef}>
          <sphereGeometry args={[SCREENER_GLOBE.R * 0.99, 96, 96]} />
          <shaderMaterial vertexShader={GRID_VERT} fragmentShader={GRID_FRAG} uniforms={gridUniforms} />
        </mesh>
        <mesh>
          <sphereGeometry args={[SCREENER_GLOBE.R, 32, 20]} />
          <meshBasicMaterial color={colors.hairline.clone().lerp(colors.accentDeep, 0.6)} wireframe transparent opacity={0.18} />
        </mesh>
        <mesh scale={1.04}>
          <sphereGeometry args={[SCREENER_GLOBE.R, 48, 48]} />
          <shaderMaterial uniforms={atmoUniforms} vertexShader={ATMO_VERT} fragmentShader={ATMO_FRAG} transparent depthWrite={false} blending={AdditiveBlending} side={BackSide} />
        </mesh>

        {/* one glowing marker per country aggregate — billboarded DOM dot, occluding against the shell so
            back-of-globe markers hide (same occlusion trick GlobeScene's AgentNode <Html> uses) */}
        {markers.map((m) => {
          const on = selectedCountry === m.country || hoverCountry === m.country
          return (
            <group key={m.country} position={[m.pos.x, m.pos.y, m.pos.z]}>
              <Html occlude={[shellRef]} zIndexRange={[20, 0]} center>
                <button
                  type="button"
                  className={`sglobe__marker${on ? ' sglobe__marker--on' : ''}`}
                  style={{ ['--r' as any]: `${m.radius * 11}px`, ['--tone' as any]: m.maxScore >= 70 ? 'var(--live)' : m.maxScore >= 40 ? 'var(--accent-bright)' : 'var(--accent)' }}
                  onMouseEnter={() => onHover(m.country)}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => onSelect(m.country)}
                  title={`${m.countryName} — ${m.count} event${m.count === 1 ? '' : 's'}`}
                >
                  <span className="sglobe__marker-core" />
                  {on && <span className="sglobe__marker-label">{m.countryName} · {m.count}</span>}
                </button>
              </Html>
            </group>
          )
        })}
      </group>
    </>
  )
}
