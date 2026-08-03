type AskFocusTarget = Pick<HTMLElement, 'focus' | 'isConnected'> & { disabled?: boolean }

let opener: AskFocusTarget | null = null

function canFocus(value: unknown): value is AskFocusTarget {
  const target = value as AskFocusTarget | null
  return !!target && typeof target.focus === 'function'
}

// Capture the control that actually opened a drawer. Scope-specific `Chat ▸` controls remain mounted behind
// the drawer and should get focus back; command-bar Ask remains the fallback for openers (such as History
// rows) that unmount as navigation completes.
export function captureAskOpener(target?: HTMLElement | null): void {
  const active = target ?? (typeof document !== 'undefined' ? document.activeElement : null)
  opener = canFocus(active) ? active : null
}

// Both Ask drawers share the same close contract, preventing signal and news chat from drifting apart.
export function restoreAskEntryFocus(): void {
  if (typeof document === 'undefined') return
  const captured = opener
  opener = null
  const focus = () => {
    const fallback = document.querySelector<HTMLButtonElement>('[data-ask-entry="true"]')
    const target = captured && captured.isConnected !== false && !captured.disabled ? captured : fallback
    target?.focus()
  }
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(focus)
  else focus()
}

// History can replace the thread while ChatPanel is already mounted behind it, so mount-time autofocus does
// not run again. Focus the newly active drawer explicitly after that handoff.
export function focusAskDrawer(): void {
  if (typeof document === 'undefined') return
  const focus = () => {
    const composer = document.querySelector<HTMLTextAreaElement>('[data-ask-composer="true"]:not(:disabled)')
    const close = document.querySelector<HTMLButtonElement>('[data-ask-close="true"]')
    const target = composer || close
    target?.focus()
  }
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(focus)
  else focus()
}
