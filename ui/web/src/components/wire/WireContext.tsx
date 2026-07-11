// WireConfig context — how the shared wire components learn WHICH swarm's wire they are rendering
// without a swarm id ever appearing in their code (ui/web/DESIGN.md "wire component contract").
// The provider sits in WireSurface; the default value is the grandfathered screener config, so any
// legacy mount that predates the provider renders bit-identical to the pre-wire screener stage.

import { createContext, useContext } from 'react'
import type { WireConfig } from '../../lib/wire'

// the grandfathered flow default — what an unwrapped consumer (or the flow stage itself) gets
export const FLOW_WIRE_CONFIG: WireConfig = {
  swarmId: '', // identity intentionally blank in the fallback — components must not branch on it anyway
  flow: true,
  groupBy: null,
  subjects: [],
  pulse: false,
  defaultView: 'latest',
}

const WireConfigContext = createContext<WireConfig>(FLOW_WIRE_CONFIG)

export const WireProvider = WireConfigContext.Provider

/** The active wire's capabilities. Branch on these (flow / groupBy / eventScope / pulse) — never on
 *  a swarm id (enforced by ui/server/test/wire-purity.test.ts). */
export function useWireConfig(): WireConfig {
  return useContext(WireConfigContext)
}
