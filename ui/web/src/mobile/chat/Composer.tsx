// The input row. Touch contract (each the opposite of the desktop drawer, deliberately):
//   - the SEND BUTTON sends; Enter inserts a newline on a coarse pointer (a phone keyboard's Enter is
//     its newline key — desktop's Enter-sends makes multi-line questions impossible there)
//   - on a fine pointer (the phone view opened on a laptop) Enter still sends, Shift+Enter newlines,
//     so a keyboard user keeps the desktop muscle memory
//   - 16px font on the textarea — anything smaller makes iOS Safari zoom the page on focus
import { useCallback, useRef } from 'react'

const finePointer = () => typeof matchMedia !== 'undefined' && matchMedia('(hover: hover) and (pointer: fine)').matches

export function Composer({ placeholder, disabled, streaming, onSend, onStop }: {
  placeholder: string
  disabled?: boolean
  streaming: boolean
  onSend: (text: string) => void
  onStop: () => void
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const submit = useCallback(() => {
    const el = ref.current
    const q = el?.value.trim()
    if (!q || disabled || streaming) return
    onSend(q)
    if (el) { el.value = ''; el.style.height = 'auto' }
  }, [disabled, streaming, onSend])

  return (
    <div className="mchat__composer">
      <textarea
        ref={ref}
        className="mchat__input"
        rows={1}
        placeholder={placeholder}
        disabled={disabled}
        enterKeyHint="enter"
        onInput={(e) => {
          const el = e.currentTarget
          el.style.height = 'auto'
          el.style.height = `${Math.min(el.scrollHeight, 144)}px` // ~6 lines, then the textarea scrolls
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && finePointer()) { e.preventDefault(); submit() }
        }}
      />
      {streaming ? (
        <button className="mchat__send mchat__send--stop" onClick={onStop} aria-label="Stop the answer">◼</button>
      ) : (
        <button className="mchat__send" onClick={submit} disabled={disabled} aria-label="Send">↑</button>
      )}
    </div>
  )
}
