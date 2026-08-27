import { useEffect, useState } from 'react'
import { api } from './api'
import { chatModelChoices, saveChatModel, type ChatModelChoice } from './chatModels'

/** Keep every Ask picker aligned with the server's actual model allow-list. */
export function useChatModelChoices(model: string, onSelect: (model: string) => void): readonly ChatModelChoice[] {
  const [choices, setChoices] = useState<readonly ChatModelChoice[]>(() => chatModelChoices([model]))

  useEffect(() => {
    let cancelled = false
    setChoices((current) => current.some((choice) => choice.id === model)
      ? current
      : [...chatModelChoices([model]), ...current])
    void api.chatModels().then((read) => {
      if (cancelled) return
      const available = chatModelChoices(read.models)
      setChoices(available)
      if (available.length && !read.models.includes(model)) {
        const fallback = available.find((choice) => choice.id === read.defaultModel)?.id || available[0].id
        saveChatModel(fallback)
        onSelect(fallback)
      }
    }).catch(() => { /* preserve the current truthful/unknown choice until a later read succeeds */ })
    return () => { cancelled = true }
  }, [model, onSelect])

  return choices
}
