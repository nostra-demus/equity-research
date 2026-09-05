export type ChatModelProvider = 'claude' | 'codex'

export interface ChatModelChoice {
  id: string
  provider: ChatModelProvider
  label: string
  sub: string
  disabled?: boolean
}

export const CHAT_MODEL_STORAGE_KEY = 'nsw.chatModel'
export const DEFAULT_CHAT_MODEL = 'sonnet'

export const CHAT_MODELS: readonly ChatModelChoice[] = [
  { id: 'sonnet', provider: 'claude', label: 'Sonnet', sub: 'fast · strong default' },
  { id: 'opus', provider: 'claude', label: 'Opus', sub: 'deepest Claude reasoning' },
  { id: 'haiku', provider: 'claude', label: 'Haiku', sub: 'fastest · lightest' },
  { id: 'codex:gpt-5.6-sol', provider: 'codex', label: 'GPT-5.6 Sol', sub: 'strongest GPT · max reasoning' },
  { id: 'codex:gpt-5.6-terra', provider: 'codex', label: 'GPT-5.6 Terra', sub: 'balanced GPT · medium reasoning' },
  { id: 'codex:gpt-5.6-luna', provider: 'codex', label: 'GPT-5.6 Luna', sub: 'fastest GPT · light reasoning' },
] as const

export interface ChatModelsRead {
  models: string[]
  defaultModel: string | null
}

export function chatModelsReadAfterFailure(error: unknown, previous: ChatModelsRead | null): ChatModelsRead | null {
  const status = error && typeof error === 'object' && 'status' in error
    ? (error as { status?: unknown }).status
    : undefined
  return status === 404
    ? { models: ['sonnet', 'opus', 'haiku'], defaultModel: 'sonnet' }
    : previous
}

export function normalizeChatModelsRead(value: unknown): ChatModelsRead | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const read = value as Record<string, unknown>
  if (!Array.isArray(read.models)) return null
  const models = [...new Set(read.models.filter(isChatModel))]
  if (!models.length) return null
  const defaultModel = typeof read.defaultModel === 'string' && models.includes(read.defaultModel)
    ? read.defaultModel
    : models[0] ?? null
  return { models, defaultModel }
}

export function isChatModel(value: unknown): value is string {
  return typeof value === 'string' && (
    CHAT_MODELS.some((choice) => choice.id === value)
    || (/^claude-[A-Za-z0-9._-]{1,53}$/.test(value) && value.length <= 60)
    // The server remains the authority that admits reviewed Codex ids. Accepting the bounded shape here
    // lets an older browser render a newer server-reviewed model during a rolling deployment.
    || (/^codex:[A-Za-z0-9._-]{1,53}$/.test(value) && value.length <= 60)
  )
}

export function chatModelChoices(ids: readonly string[]): ChatModelChoice[] {
  return ids.flatMap((id) => {
    const reviewed = CHAT_MODELS.find((choice) => choice.id === id)
    if (reviewed) return [reviewed]
    if (!isChatModel(id)) return []
    const codex = id.startsWith('codex:')
    return [{
      id,
      provider: codex ? 'codex' as const : 'claude' as const,
      label: codex ? id.slice('codex:'.length) : id,
      sub: codex ? 'host-configured Codex model' : 'host-configured Claude model',
    }]
  })
}

export function chatModelLabel(value: string): string {
  return CHAT_MODELS.find((choice) => choice.id === value)?.label
    ?? (value.startsWith('codex:') ? value.slice('codex:'.length) : value)
}

export function readChatModel(
  storage?: Pick<Storage, 'getItem'> | null,
): string {
  try {
    const store = storage !== undefined ? storage : (typeof window === 'undefined' ? null : window.localStorage)
    const value = store?.getItem(CHAT_MODEL_STORAGE_KEY)
    return isChatModel(value) ? value : DEFAULT_CHAT_MODEL
  } catch {
    return DEFAULT_CHAT_MODEL
  }
}

export function saveChatModel(
  model: string,
  storage?: Pick<Storage, 'setItem'> | null,
): void {
  if (!isChatModel(model)) return
  try {
    const store = storage !== undefined ? storage : (typeof window === 'undefined' ? null : window.localStorage)
    store?.setItem(CHAT_MODEL_STORAGE_KEY, model)
  } catch { /* private mode or blocked storage */ }
}
