import { useRef, useState } from 'react'
import { useStore } from '../lib/store'

// Drag-and-drop (or click-to-choose) uploader. Files stream to the server, which writes them into the
// company's shared Google Drive folder; they reappear in the cockpit once Drive syncs them back down.
// The allow-list mirrors UPLOAD_ALLOWED_EXTS on the server (the server stays authoritative).
const ALLOWED = ['pdf', 'xlsx', 'xls', 'csv', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'md', 'json', 'png', 'jpg', 'jpeg']
const ACCEPT = ALLOWED.map((e) => '.' + e).join(',')
const extOk = (name: string) => { const e = name.includes('.') ? name.split('.').pop()!.toLowerCase() : ''; return !!e && ALLOWED.includes(e) }

export function Uploader({ ticker }: { ticker: string }) {
  const uploadFiles = useStore((s) => s.uploadFiles)
  const uploading = useStore((s) => s.uploading)
  const progress = useStore((s) => s.uploadProgress)
  const errors = useStore((s) => s.uploadErrors)
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const [rejected, setRejected] = useState<string[]>([])

  const send = (list: FileList | File[] | null) => {
    if (!list) return
    const files = Array.from(list)
    const ok = files.filter((f) => extOk(f.name))
    setRejected(files.filter((f) => !extOk(f.name)).map((f) => f.name))
    if (ok.length) void uploadFiles(ticker, ok)
  }

  const names = Object.keys(progress)
  return (
    <div className="uploader">
      <div
        className={`uploader__zone${drag ? ' is-drag' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); send(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
      >
        <input ref={inputRef} type="file" multiple accept={ACCEPT} style={{ display: 'none' }} onChange={(e) => { send(e.target.files); e.currentTarget.value = '' }} />
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 16V4m0 0L8 8m4-4l4 4" /><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
        <div className="uploader__text"><b>Drop documents</b> here or click to choose — they upload straight into <b>{ticker}</b>’s Google Drive folder.</div>
        <div className="uploader__hint">PDF · Excel · CSV · Word · PowerPoint · text — up to 40 MB each</div>
      </div>
      {uploading && names.length > 0 && (
        <div className="uploader__progress">
          {names.map((n) => (
            <div className="uploader__file" key={n}>
              <span className="uploader__fname" title={n}>{n}</span>
              <span className="uploader__bar"><span className="uploader__barfill" style={{ width: `${Math.round((progress[n] || 0) * 100)}%` }} /></span>
            </div>
          ))}
        </div>
      )}
      {(rejected.length > 0 || errors.length > 0) && (
        <div className="uploader__errors">
          {rejected.map((n) => <div key={`r-${n}`}>✕ {n} — unsupported file type</div>)}
          {errors.map((e, i) => <div key={`e-${i}`}>✕ {e.filename} — {e.reason}</div>)}
        </div>
      )}
    </div>
  )
}
