export type ChatModelProvider = 'claude' | 'codex'

export interface ChatModelSpec {
  id: string
  provider: ChatModelProvider
  model: string
  reasoningLevel?: 'low' | 'medium' | 'high'
}

// Chat ids are provider-qualified only where the underlying model name could otherwise be confused with
// a Claude alias. The three legacy Claude ids stay unchanged so saved conversations remain resumable.
export const CHAT_MODEL_SPECS: readonly ChatModelSpec[] = [
  { id: 'sonnet', provider: 'claude', model: 'sonnet' },
  { id: 'opus', provider: 'claude', model: 'opus' },
  { id: 'haiku', provider: 'claude', model: 'haiku' },
  { id: 'codex:gpt-5.6-sol', provider: 'codex', model: 'gpt-5.6-sol', reasoningLevel: 'medium' },
  { id: 'codex:gpt-5.6-terra', provider: 'codex', model: 'gpt-5.6-terra', reasoningLevel: 'medium' },
  { id: 'codex:gpt-5.6-luna', provider: 'codex', model: 'gpt-5.6-luna', reasoningLevel: 'low' },
] as const

export const DEFAULT_CHAT_MODEL_ID = 'sonnet'
export const DEFAULT_CHAT_MODEL_IDS = CHAT_MODEL_SPECS.map((choice) => choice.id).join(',')

export function resolveChatModel(value: unknown): ChatModelSpec | null {
  const id = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return CHAT_MODEL_SPECS.find((choice) => choice.id === id) ?? null
}
