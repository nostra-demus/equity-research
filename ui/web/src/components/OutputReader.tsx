import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useStore } from '../lib/store'
import { api } from '../lib/api'

export function OutputReader({ output }: { output: { path: string; title: string } }) {
  const close = useStore((s) => s.closeOutput)
  const [md, setMd] = useState<string>('')
  const [loading, setLoading] = useState(false)

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

  return (
    <motion.div className="reader" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="reader__head">
        <div>
          <div className="reader__title">{output.title}</div>
          <div className="reader__path">{output.path}</div>
        </div>
        <button className="btn btn--ghost" style={{ height: 30 }} onClick={close}>Close ✕</button>
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
