import { useEffect, useState } from 'react'
import { api } from './api'
import { CHAT_MODELS, saveChatModel, type ChatModelChoice } from './chatModels'

/** Keep every Ask picker aligned with the server's actual model allow-list. */
export function useChatModelChoices(model: string, onSelect: (model: string) => void): readonly ChatModelChoice[] {
  const [choices, setChoices] = useState<readonly ChatModelChoice[]>(CHAT_MODELS)

  useEffect(() => {
    let cancelled = false
    void api.chatModels().then((read) => {
      if (cancelled) return
      const available = CHAT_MODELS.filter((choice) => read.models.includes(choice.id))
      setChoices(available)
      if (available.length && !read.models.includes(model)) {
        const fallback = available.find((choice) => choice.id === read.defaultModel)?.id || available[0].id
        saveChatModel(fallback)
        onSelect(fallback)
      }
    })
    return () => { cancelled = true }
  }, [model, onSelect])

  return choices
}
