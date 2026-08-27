import { CHAT_MODELS, chatModelLabel } from '../../lib/chatModels'

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
  return (
    <div style={{ position: 'relative' }} data-chat-model-picker="true">
      <button
        className="btn"
        style={{ height: 30 }}
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        title="Model used for the answer"
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
                {CHAT_MODELS.filter((choice) => choice.provider === provider.id).map((choice) => (
                  <button
                    key={choice.id}
                    className="dlmenu__item"
                    role="menuitemradio"
                    aria-checked={choice.id === model}
                    onClick={() => { onSelect(choice.id); onOpenChange(false) }}
                  >
                    <b>{choice.label}{choice.id === model ? ' ✓' : ''}</b><span>{choice.sub}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
