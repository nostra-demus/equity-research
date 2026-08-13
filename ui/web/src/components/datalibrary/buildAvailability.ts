import type { RecommendedNeed } from '../../lib/types'

export const AUTOMATIC_CONNECTOR_CODING_UNAVAILABLE =
  'Automatic connector coding is unavailable on this runtime. Use the manual branch and pull-request workflow.'

/** Keep source discovery useful without implying that the hard-disabled coding agent will run afterward. */
export function recommendedDiscoveryAction(canBuild: boolean): { label: string; title: string } {
  return canBuild
    ? {
        label: 'Find & build ▸',
        title: 'Find the source and send it to the isolated connector builder.',
      }
    : {
        label: 'Find source ▸',
        title: 'Find the primary source. Automatic connector coding is unavailable; implement it through the manual branch and pull-request workflow.',
      }
}

/** Exact decision identity for a recommended-row search; old/deploy-skew rows fail closed. */
export function recommendedDiscoveryRequest(need: RecommendedNeed, autoBuild: boolean): {
  swarm: string
  opts: { need_id: string; runRoot: string; decisionFingerprint: string; want: string; autoBuild: boolean }
} | null {
  if (!need.run_root || !/^sha256:[a-f0-9]{64}$/.test(need.decision_fingerprint || '')) return null
  return {
    swarm: need.swarm,
    opts: {
      need_id: need.need_id,
      runRoot: need.run_root,
      decisionFingerprint: need.decision_fingerprint!,
      want: need.series,
      autoBuild,
    },
  }
}
