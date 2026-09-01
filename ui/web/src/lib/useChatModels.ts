import { useEffect, useRef, useState } from 'react'
import { api } from './api'
import { chatModelChoices, type ChatModelChoice } from './chatModels'

/** Keep every Ask picker aligned with the server's actual model allow-list. */
export function useChatModelChoices(model: string): readonly ChatModelChoice[] {
  const [choices, setChoices] = useState<readonly ChatModelChoice[]>(() => chatModelChoices([model]))
  const modelRef = useRef(model)

  useEffect(() => { modelRef.current = model }, [model])

  useEffect(() => {
    setChoices((current) => current.some((choice) => choice.id === model)
      ? current
      : [...chatModelChoices([model]), ...current])
  }, [model])

  useEffect(() => {
    let cancelled = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let retryMs = 2_000
    const load = async () => {
      try {
        const read = await api.chatModels()
        if (cancelled) return
        const available = chatModelChoices(read.models)
        const currentModel = modelRef.current
        const current = chatModelChoices([currentModel])[0]
        // Never switch the user's selected model behind their back. If the host stops admitting it, retain
        // the row as an explicit unavailable choice until the user manually picks another model.
        setChoices(current && !read.models.includes(currentModel)
          ? [{ ...current, sub: 'selected · unavailable on this host', disabled: true }, ...available]
          : available)
        retryMs = 2_000
        retryTimer = setTimeout(() => { void load() }, 60_000)
      } catch {
        if (cancelled) return
        retryTimer = setTimeout(() => { void load() }, retryMs)
        retryMs = Math.min(retryMs * 2, 30_000)
      }
    }
    void load()
    return () => { cancelled = true; if (retryTimer) clearTimeout(retryTimer) }
  }, [])

  return choices
}
