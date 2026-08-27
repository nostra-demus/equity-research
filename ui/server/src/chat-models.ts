export type ChatModelProvider = 'claude' | 'codex'
export type CodexReasoningEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max'

export interface ChatModelSpec {
  id: string
  provider: ChatModelProvider
  model: string
  reasoningLevel?: CodexReasoningEffort
  parserReasoningLevel?: CodexReasoningEffort
}

// Chat ids are provider-qualified only where the underlying model name could otherwise be confused with
// a Claude alias. The three legacy Claude ids stay unchanged so saved conversations remain resumable.
export const CHAT_MODEL_SPECS: readonly ChatModelSpec[] = [
  { id: 'sonnet', provider: 'claude', model: 'sonnet' },
  { id: 'opus', provider: 'claude', model: 'opus' },
  { id: 'haiku', provider: 'claude', model: 'haiku' },
  { id: 'codex:gpt-5.6-sol', provider: 'codex', model: 'gpt-5.6-sol', reasoningLevel: 'max', parserReasoningLevel: 'low' },
  { id: 'codex:gpt-5.6-terra', provider: 'codex', model: 'gpt-5.6-terra', reasoningLevel: 'medium', parserReasoningLevel: 'medium' },
  { id: 'codex:gpt-5.6-luna', provider: 'codex', model: 'gpt-5.6-luna', reasoningLevel: 'low', parserReasoningLevel: 'low' },
] as const

export const DEFAULT_CHAT_MODEL_ID = 'sonnet'
export const DEFAULT_CHAT_MODEL_IDS = CHAT_MODEL_SPECS.map((choice) => choice.id).join(',')

export function resolveChatModel(value: unknown): ChatModelSpec | null {
  const id = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return CHAT_MODEL_SPECS.find((choice) => choice.id === id) ?? null
}

// Reviewed catalogue ids get their explicit provider route. A host may also pin a concrete Claude model
// id through ENGINE_CHAT_MODELS_ALLOWED; preserve that pre-existing escape hatch without letting an unknown
// provider-qualified Codex id bypass the reviewed GPT catalogue.
export function resolveAllowedChatModel(value: unknown, allowedModels: readonly string[]): ChatModelSpec | null {
  const id = typeof value === 'string' ? value.trim() : ''
  if (!id) return null
  const reviewed = resolveChatModel(id)
  if (reviewed) return allowedModels.includes(reviewed.id) ? reviewed : null
  if (id.toLowerCase().startsWith('codex:') || !allowedModels.includes(id)) return null
  return { id, provider: 'claude', model: id }
}

/** Resolve an HTTP request without ever substituting a different explicitly requested model. */
export function resolveChatRequestModel(
  value: unknown,
  allowedModels: readonly string[],
  defaultModel: string,
): ChatModelSpec | null {
  const requested = typeof value === 'string' ? value.trim() : ''
  return resolveAllowedChatModel(requested || defaultModel, allowedModels)
}

/** The reviewed catalogue the browser may truthfully offer for this host configuration. */
export function publicChatModelCatalogue(allowedModels: readonly string[], defaultModel: string): {
  models: string[]
  defaultModel: string | null
} {
  const models = CHAT_MODEL_SPECS
    .filter((choice) => Boolean(resolveAllowedChatModel(choice.id, allowedModels)))
    .map((choice) => choice.id)
  return {
    models,
    defaultModel: models.includes(defaultModel) ? defaultModel : models[0] ?? null,
  }
}
