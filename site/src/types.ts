export interface Agent {
  nn: string
  slug: string
  name: string
  file: string
  verdict: string | null
  isSynthesis: boolean
  bytes: number
}
export interface Module {
  name: string
  label: string
  score: number | null
  verdict: string | null
  agents: Agent[]
}
export interface Manifest {
  run: string
  ticker: string
  date: string
  decision: any
  modules: Module[]
  files: {
    finalThesis: string | null
    finalThesisExpanded: string | null
    runMetadata: string | null
    verification: string | null
    preMortem: string | null
    expectationsGap: string | null
  }
  generatedAt: string
}
