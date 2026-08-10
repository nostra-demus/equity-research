// The bottom-sheet primitive every picker uses. Motion per DESIGN.md §3: transform/opacity only, the
// shared duration tokens (CSS), reduced-motion clamps in CSS. Scrim tap closes; the grabber is
// decoration (a swipe gesture would need a drag lib the budget doesn't want — the scrim is the close).
import { useEffect } from 'react'

export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: React.ReactNode; label: string }) {
  // Escape still works when a keyboard exists (the phone view opened on a laptop)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="msheet__scrim" onClick={onClose}>
      <div className="msheet" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        <div className="msheet__grab" aria-hidden />
        {children}
      </div>
    </div>
  )
}
