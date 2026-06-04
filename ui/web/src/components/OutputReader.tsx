import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useStore } from '../lib/store'
import { api } from '../lib/api'
import { buildReportHtml, parseMeta, safeName } from '../lib/export'
import { buildDocxBlob } from '../lib/docx'

export function OutputReader({ output }: { output: { path: string; title: string; verdict?: string | null } }) {
  const close = useStore((s) => s.closeOutput)
  const [md, setMd] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    setLoading(true)
    setMd('')
    api
      .output(output.path)
      .then((r) => setMd(r.markdown))
      .catch(() => setMd('*Could not load this output.*'))
      .finally(() => setLoading(false))
  }, [output.path])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  // All exports are generated client-side from the loaded markdown, so they work
  // identically with the local control plane and on the static Cloudflare showcase
  // (which has no /api backend). The styling matches ui/server/src/export.ts.
  const meta = parseMeta(output.path, output.title, output.verdict)
  const saveBlob = (blob: Blob, filename: string) => {
    const u = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = u
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(u), 2000)
  }
  const onPDF = () => {
    if (!md) return
    const html = buildReportHtml(md, meta, { print: true })
    const w = window.open('', '_blank')
    if (w) {
      w.document.open()
      w.document.write(html)
      w.document.close()
    } else {
      // popup blocked — hand the user a self-contained HTML file they can open & print
      saveBlob(new Blob([buildReportHtml(md, meta)], { type: 'text/html;charset=utf-8' }), `${safeName(meta)}.html`)
    }
    setMenu(false)
  }
  const onWord = async () => {
    if (!md) return
    setMenu(false)
    try {
      const blob = await buildDocxBlob(md, meta) // real Office Open XML (.docx)
      saveBlob(blob, `${safeName(meta)}.docx`)
    } catch {
      // last-resort fallback: hand over the styled HTML report instead of failing silently
      saveBlob(new Blob([buildReportHtml(md, meta)], { type: 'text/html;charset=utf-8' }), `${safeName(meta)}.html`)
    }
  }
  const onHTML = () => {
    if (!md) return
    saveBlob(new Blob([buildReportHtml(md, meta)], { type: 'text/html;charset=utf-8' }), `${safeName(meta)}.html`)
    setMenu(false)
  }
  const onMD = () => {
    if (!md) return
    saveBlob(new Blob([md], { type: 'text/markdown;charset=utf-8' }), `${safeName(meta)}.md`)
    setMenu(false)
  }

  return (
    <motion.div className="reader" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="reader__head">
        <div style={{ minWidth: 0 }}>
          <div className="reader__title">
            <span className="reader__done">✓ Completed</span> {output.title}
          </div>
          {output.verdict ? <div className="reader__verdict">{output.verdict}</div> : <div className="reader__path">{output.path}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <button className="btn btn--amber" style={{ height: 30 }} onClick={() => setMenu((o) => !o)}>Download ▾</button>
            {menu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 51 }} onClick={() => setMenu(false)} />
                <div className="dlmenu">
                  <button className="dlmenu__item" onClick={onPDF}><b>PDF</b><span>print-ready · opens & prints</span></button>
                  <button className="dlmenu__item" onClick={onWord}><b>Word</b><span>.docx document</span></button>
                  <button className="dlmenu__item" onClick={onHTML}><b>HTML</b><span>self-contained report</span></button>
                  <button className="dlmenu__item" onClick={onMD}><b>Markdown</b><span>raw .md source</span></button>
                </div>
              </>
            )}
          </div>
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={close}>Close ✕</button>
        </div>
      </div>
      <div className="reader__body">
        {loading ? (
          <div style={{ color: 'var(--text-faint)' }}>Loading…</div>
        ) : (
          <div className="md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  )
}
