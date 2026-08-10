// The scope picker — the desktop drawer's "Chat with" menu as a sheet, fed by GET /api/chat/scopes
// (built for exactly this: the desktop derives availability from its hydrated graph; the phone has no
// graph, and the endpoint returns the identical shape from the server's own rules). Parity details:
// every declared module is LISTED, un-run ones disabled with a "run first" pill; orb scope is not
// creatable here (desktop's menu can't either — orbs come from the document reader / resumed chats).
import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { ChatScopes } from '../../lib/types'
import { Sheet } from './Sheet'

const titleize = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export function ScopeSheet({ open, swarm, subject, current, onPick, onClose }: {
  open: boolean
  swarm: string
  subject: string
  current: { scope: string; module?: string }
  onPick: (scope: 'run' | 'module', module?: string) => void
  onClose: () => void
}) {
  const [scopes, setScopes] = useState<ChatScopes | null>(null)

  useEffect(() => {
    if (!open) return
    let dead = false
    setScopes(null)
    void api.chatScopes(subject, swarm).then((s) => { if (!dead) setScopes(s) }).catch(() => { if (!dead) setScopes(null) })
    return () => { dead = true }
  }, [open, swarm, subject])

  return (
    <Sheet open={open} onClose={onClose} label="Chat with">
      <div className="msheet__head">Chat with</div>
      <div className="msheet__list">
        {!scopes && <div className="msheet__empty">Loading…</div>}
        {scopes && (
          <>
            <button
              className={`msheet__row${current.scope === 'run' ? ' msheet__row--on' : ''}`}
              disabled={!scopes.run.present}
              onClick={() => onPick('run')}
            >
              <span className="msheet__rowlabel">Whole run</span>
              {scopes.run.present
                ? <span className="msheet__rowsub">thesis + every module synthesis</span>
                : <span className="msheet__pill msheet__pill--off">run first</span>}
            </button>
            {scopes.modules.map((m) => (
              <button
                key={m.module}
                className={`msheet__row${current.scope === 'module' && current.module === m.module ? ' msheet__row--on' : ''}`}
                disabled={!m.present}
                onClick={() => onPick('module', m.module)}
              >
                <span className="msheet__rowlabel">{titleize(m.module)}</span>
                {m.present
                  ? <span className="msheet__rowsub">this module’s output</span>
                  : <span className="msheet__pill msheet__pill--off">run first</span>}
              </button>
            ))}
          </>
        )}
      </div>
    </Sheet>
  )
}
