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
