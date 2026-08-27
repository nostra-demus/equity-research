export type ChatModelProvider = 'claude' | 'codex'

export interface ChatModelChoice {
  id: string
  provider: ChatModelProvider
  label: string
  sub: string
}

export const CHAT_MODEL_STORAGE_KEY = 'nsw.chatModel'
export const DEFAULT_CHAT_MODEL = 'sonnet'

export const CHAT_MODELS: readonly ChatModelChoice[] = [
  { id: 'sonnet', provider: 'claude', label: 'Sonnet', sub: 'fast · strong default' },
  { id: 'opus', provider: 'claude', label: 'Opus', sub: 'deepest Claude reasoning' },
  { id: 'haiku', provider: 'claude', label: 'Haiku', sub: 'fastest · lightest' },
  { id: 'codex:gpt-5.6-sol', provider: 'codex', label: 'GPT-5.6 Sol', sub: 'strongest GPT · medium reasoning' },
  { id: 'codex:gpt-5.6-terra', provider: 'codex', label: 'GPT-5.6 Terra', sub: 'balanced GPT · medium reasoning' },
  { id: 'codex:gpt-5.6-luna', provider: 'codex', label: 'GPT-5.6 Luna', sub: 'fastest GPT · light reasoning' },
] as const

export function isChatModel(value: unknown): value is string {
  return typeof value === 'string' && CHAT_MODELS.some((choice) => choice.id === value)
}

export function chatModelLabel(value: string): string {
  return CHAT_MODELS.find((choice) => choice.id === value)?.label ?? value
}

export function readChatModel(
  storage: Pick<Storage, 'getItem'> | null = typeof localStorage === 'undefined' ? null : localStorage,
): string {
  try {
    const value = storage?.getItem(CHAT_MODEL_STORAGE_KEY)
    return isChatModel(value) ? value : DEFAULT_CHAT_MODEL
  } catch {
    return DEFAULT_CHAT_MODEL
  }
}

export function saveChatModel(
  model: string,
  storage: Pick<Storage, 'setItem'> | null = typeof localStorage === 'undefined' ? null : localStorage,
): void {
  if (!isChatModel(model)) return
  try { storage?.setItem(CHAT_MODEL_STORAGE_KEY, model) } catch { /* private mode */ }
}
