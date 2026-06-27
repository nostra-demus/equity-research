// Pure geometry constants + plain-object vector helpers for the globe layout. NO three.js import here, so
// the layout math stays in the main bundle's reach and is testable without WebGL. GlobeScene converts the
// plain {x,y,z} points to THREE.Vector3 at mount.

export type V3 = { x: number; y: number; z: number }

export const GLOBE = {
  WRAP_SECONDS: 1.7, // duration of the flat↔sphere wrap/unwrap — shared by GlobeScene's morph AND App's
  // crossfade exit, so leaving the globe stays mounted long enough to flatten ALL the way into the constellation
  R: 10, // sphere radius (world units)
  POLE_BIAS: 0.18, // bias module band into the upper hemisphere, leaving the south cap for the Memo core
  Y_CLAMP_TOP: 0.94,
  Y_CLAMP_BOTTOM: -0.72,
  LAYER_GAP: 1.12, // tangent-plane ring radius step per layer (pre-projection, world units)
  ARC_MAX: 1.45, // max arc span (rad) a layer's agents spread across within a module patch
  ARC_PER_NODE: 0.46,
  BUMP_SYNTH: 0.75, // synthesis hub pushed out along the surface normal (crowns the patch)
  BUMP_SURFACE: 0.16, // agents lifted just off the surface so they never z-fight the shell
  CORE_BUMP: 1.7, // Memo node sits this far below the south pole, outside the shell
  R_AGENT: 0.22, // orb radius
  R_SYNTH: 0.4,
  R_CORE: 0.82,
}

export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)) // ≈2.39996 rad — even Fibonacci-sphere spacing

export const v = (x = 0, y = 0, z = 0): V3 => ({ x, y, z })
export const add = (a: V3, b: V3): V3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z })
export const sub = (a: V3, b: V3): V3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z })
export const scale = (a: V3, s: number): V3 => ({ x: a.x * s, y: a.y * s, z: a.z * s })
export const len = (a: V3): number => Math.hypot(a.x, a.y, a.z)
export const normalize = (a: V3): V3 => {
  const l = len(a) || 1
  return { x: a.x / l, y: a.y / l, z: a.z / l }
}
export const cross = (a: V3, b: V3): V3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
})
export const dot = (a: V3, b: V3): number => a.x * b.x + a.y * b.y + a.z * b.z
export const lerp = (a: V3, b: V3, t: number): V3 => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  z: a.z + (b.z - a.z) * t,
})
// project a point onto the sphere shell at radius (R + bump)
export const onSphere = (p: V3, radius: number): V3 => scale(normalize(p), radius)
