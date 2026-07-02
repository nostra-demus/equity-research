// Small inline spinner shared by every busy control — reuses the empty-state primitive (`.empty__spin`),
// which already carries its own prefers-reduced-motion guard, so a busy button reads as working without
// a new keyframe. Extracted from ReadinessWarnings — the model click→pending→SSE-resolve button pattern
// every launch/stop control now follows.
export function Spin() {
  return (
    <svg className="empty__spin rdg-spin" width="13" height="13" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v5h-5" />
    </svg>
  )
}
