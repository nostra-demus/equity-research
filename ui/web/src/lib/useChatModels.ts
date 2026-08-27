import { useEffect, useRef, useState } from 'react'
import { api } from './api'
import { chatModelChoices, saveChatModel, type ChatModelChoice } from './chatModels'

/** Keep every Ask picker aligned with the server's actual model allow-list. */
export function useChatModelChoices(model: string, onSelect: (model: string) => void): readonly ChatModelChoice[] {
  const [choices, setChoices] = useState<readonly ChatModelChoice[]>(() => chatModelChoices([model]))
  const onSelectRef = useRef(onSelect)
  const modelRef = useRef(model)

  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])
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
        setChoices(available)
        const currentModel = modelRef.current
        if (available.length && !read.models.includes(currentModel)) {
          const fallback = available.find((choice) => choice.id === read.defaultModel)?.id || available[0].id
          saveChatModel(fallback)
          onSelectRef.current(fallback)
        }
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
