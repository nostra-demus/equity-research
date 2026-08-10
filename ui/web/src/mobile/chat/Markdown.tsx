// The markdown renderer, split into its own lazy chunk (~40 KB gzip with remark-gfm) so the mobile
// boot path stays inside the §8 budget. Thread.tsx shows the raw text until this loads.
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Markdown({ text }: { text: string }) {
  return (
    <div className="mchat__md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  )
}
