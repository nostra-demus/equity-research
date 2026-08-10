// The mobile shell's saved preferences — all plain localStorage, deliberately store-free (the same
// pattern as ThemeToggle: state that must survive reloads and must not entangle the app store).
//
// Two keys are SHARED with the desktop app so a choice made on either side carries over:
//   nsw.theme      — 'light' | absent (dark)
//   nsw.chatStyle  — 'simple' | 'analyst' | 'detailed'
// Two are mobile-only:
//   nsw.m.subject    — the last-open {swarm, subject}, so reopening lands where you left off
//   nsw.forceDesktop — '1' pins the full app: the desktop redirect script checks this exact key
//                      (ui/web/index.html), and the mobile shell offers "Use desktop site" to set it.

const get = (k: string): string | null => {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}
const set = (k: string, v: string | null): void => {
  try {
    if (v === null) localStorage.removeItem(k)
    else localStorage.setItem(k, v)
  } catch {
    /* private mode — preferences just don't stick */
  }
}

export type Theme = 'dark' | 'light'
export const readTheme = (): Theme => (get('nsw.theme') === 'light' ? 'light' : 'dark')
export function applyTheme(t: Theme): void {
  if (t === 'light') document.documentElement.setAttribute('data-theme', 'light')
  else document.documentElement.removeAttribute('data-theme')
  set('nsw.theme', t === 'light' ? 'light' : null)
  // keep the browser chrome in step — same values as the pre-paint script in m/index.html
  const m = document.querySelector('meta[name="theme-color"]')
  if (m) m.setAttribute('content', t === 'light' ? '#f4f3ef' : '#0e0e10')
}

export type ChatStyle = 'simple' | 'analyst' | 'detailed'
export const readChatStyle = (): ChatStyle => {
  const v = get('nsw.chatStyle')
  return v === 'analyst' || v === 'detailed' ? v : 'simple'
}
export const saveChatStyle = (s: ChatStyle): void => set('nsw.chatStyle', s)

export interface SavedSubject {
  swarm: string
  subject: string
}
export function readSavedSubject(): SavedSubject | null {
  const raw = get('nsw.m.subject')
  if (!raw) return null
  try {
    const v = JSON.parse(raw)
    return typeof v?.swarm === 'string' && typeof v?.subject === 'string' ? { swarm: v.swarm, subject: v.subject } : null
  } catch {
    return null
  }
}
export const saveSubject = (s: SavedSubject): void => set('nsw.m.subject', JSON.stringify(s))

export function useDesktopSite(): void {
  set('nsw.forceDesktop', '1')
  location.href = '/'
}
