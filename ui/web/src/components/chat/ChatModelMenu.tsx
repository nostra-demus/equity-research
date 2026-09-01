import { chatModelLabel } from '../../lib/chatModels'
import { useChatModelChoices } from '../../lib/useChatModels'

const PROVIDERS = [
  { id: 'claude', label: 'Claude' },
  { id: 'codex', label: 'Codex · GPT' },
] as const

export function ChatModelMenu({
  model,
  open,
  onOpenChange,
  onSelect,
}: {
  model: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (model: string) => void
}) {
  const choices = useChatModelChoices(model)
  return (
    <div style={{ position: 'relative' }} data-chat-model-picker="true">
      <button
        className="btn"
        style={{ height: 30 }}
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        title="Used exactly for the answer — the engine never switches models automatically"
      >
        {chatModelLabel(model)} ▾
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 51 }} onClick={() => onOpenChange(false)} />
          <div className="dlmenu chatmodelmenu" role="menu" aria-label="Ask model">
            {PROVIDERS.map((provider) => (
              <div key={provider.id}>
                <div className="pmenu__label">{provider.label}</div>
                {choices.filter((choice) => choice.provider === provider.id).map((choice) => (
                  <button
                    key={choice.id}
                    className="dlmenu__item"
                    role="menuitemradio"
                    aria-checked={choice.id === model}
                    disabled={choice.disabled}
                    onClick={() => { if (!choice.disabled) onSelect(choice.id); onOpenChange(false) }}
                  >
                    <b>{choice.label}{choice.id === model ? ' ✓' : ''}</b><span>{choice.sub}</span>
                  </button>
                ))}
                {!choices.some((choice) => choice.provider === provider.id) && (
                  <div className="dlmenu__item" aria-disabled="true"><span>Not enabled on this host</span></div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
