import { useState } from 'react'

// Light/dark toggle. Self-contained: theme state lives on <html data-theme> + localStorage, NOT in the
// app store — so it never collides with anything else and the pre-paint script in index.html keeps it
// flash-free. Default (unset) = dark. The icon shows the TARGET action (sun when dark -> "go light",
// moon when light -> "go dark"); the label/title spell it out for screen readers.
type Theme = 'dark' | 'light'
const KEY = 'nsw.theme'

function current(): Theme {
  return typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}
function apply(t: Theme) {
  if (t === 'light') document.documentElement.setAttribute('data-theme', 'light')
  else document.documentElement.removeAttribute('data-theme')
  try { localStorage.setItem(KEY, t) } catch {}
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(current)
  const next: Theme = theme === 'dark' ? 'light' : 'dark'
  const toggle = () => { apply(next); setTheme(next) }
  return (
    <button
      className="themetoggle"
      data-theme-state={theme}
      onClick={toggle}
      title={`Switch to ${next} mode`}
      aria-label={`Switch to ${next} mode`}
    >
      {/* both icons rendered; CSS cross-fades/rotates the active one in (origin = center of the button) */}
      <svg className="themetoggle__icon themetoggle__sun" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" />
      </svg>
      <svg className="themetoggle__icon themetoggle__moon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 14.2A8 8 0 0 1 9.8 4 7 7 0 1 0 20 14.2z" />
      </svg>
    </button>
  )
}
