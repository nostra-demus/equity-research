// Shared keyboard math for button-backed ARIA radio groups. Selection follows focus, wraps at either
// edge, and disabled choices remain visible without becoming keyboard destinations.

const FORWARD_KEYS = new Set(['ArrowRight', 'ArrowDown'])
const BACKWARD_KEYS = new Set(['ArrowLeft', 'ArrowUp'])

/**
 * The DOM half of the pattern: find the sibling radios, move focus, and select — selection follows
 * focus, which is the ARIA behaviour for a radiogroup. Lifted here from ThemesView so a second and third
 * button-backed group reuse it instead of copying eleven lines each.
 */
export function handleRovingRadioKeyDown(event: {
  key: string
  currentTarget: HTMLButtonElement
  preventDefault: () => void
}): void {
  const group = event.currentTarget.closest('[role="radiogroup"]')
  if (!group) return
  const radios = Array.from(group.querySelectorAll<HTMLButtonElement>('button[role="radio"]'))
  const nextIndex = nextRovingRadioIndex(event.key, radios.indexOf(event.currentTarget), radios.map((r) => !r.disabled))
  if (nextIndex == null) return
  event.preventDefault()
  const next = radios[nextIndex]
  next.focus()
  next.click()
}

export function nextRovingRadioIndex(key: string, currentIndex: number, enabled: readonly boolean[]): number | null {
  const enabledIndexes = enabled.flatMap((isEnabled, index) => isEnabled ? [index] : [])
  if (!enabledIndexes.length) return null
  if (key === 'Home') return enabledIndexes[0]
  if (key === 'End') return enabledIndexes[enabledIndexes.length - 1]

  const direction = FORWARD_KEYS.has(key) ? 1 : BACKWARD_KEYS.has(key) ? -1 : 0
  if (!direction) return null
  const currentEnabledIndex = enabledIndexes.indexOf(currentIndex)
  if (currentEnabledIndex < 0) return direction > 0 ? enabledIndexes[0] : enabledIndexes[enabledIndexes.length - 1]
  return enabledIndexes[(currentEnabledIndex + direction + enabledIndexes.length) % enabledIndexes.length]
}

export function rovingRadioTabStopIndex(selectedIndex: number, enabled: readonly boolean[]): number {
  return selectedIndex >= 0 && enabled[selectedIndex] ? selectedIndex : enabled.findIndex(Boolean)
}
