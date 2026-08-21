export interface AgentOutputValidity {
  valid: boolean
  reasons: string[]
}

export function validateAgentOutputText(raw: unknown): AgentOutputValidity
export function validateAgentOutputFile(file: string): AgentOutputValidity
export function quarantineExactAgentArtifacts(files: string[], analysesRoot?: string, env?: NodeJS.ProcessEnv): void
export function quarantineExactSynthesisArtifact(file: string, analysesRoot?: string, env?: NodeJS.ProcessEnv): void
