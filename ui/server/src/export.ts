import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: false })

// ---- HTML-safety hardening for the exported document ----
// The exported report is served as text/html on the SAME ORIGIN as the live cockpit
// (app.nostra-demus.com). marked v12 has NO sanitizer (the old `sanitize` option was removed), so by
// default it passes raw HTML (<script>, <img onerror>), and `javascript:`/`data:` link & image URLs,
// straight through from the source markdown into that response. The source is engine/LLM-authored
// analyses/*.md built from external data the agents quote — so a hostile string surviving into a
// thesis would execute in the cockpit's origin when the report is viewed/exported. We neutralise all
// three vectors at the renderer (no new dependency): raw HTML tokens are escaped to text, and link /
// image URLs are restricted to a safe scheme allow-list (anything else collapses to "#"/empty).
const SAFE_URL = /^(?:https?:|mailto:|tel:|#|\/|\.\/|\.\.\/)/i
function safeHref(href: unknown): string {
  const h = String(href ?? '').trim()
  return SAFE_URL.test(h) ? h : '#'
}
marked.use({
  renderer: {
    // block- and inline-level raw HTML: escape it instead of emitting it live
    html(token: any) {
      const raw = typeof token === 'string' ? token : token?.raw ?? token?.text ?? ''
      return esc(String(raw))
    },
    link(token: any) {
      // marked v12 passes a token object; keep the positional fallback for safety across minors
      const href = token && typeof token === 'object' ? token.href : arguments[0]
      const text = token && typeof token === 'object' ? (this as any).parser.parseInline(token.tokens) : arguments[2]
      const safe = safeHref(href)
      return `<a href="${esc(safe)}"${safe === '#' ? '' : ' rel="noopener noreferrer"'}>${text}</a>`
    },
    image(token: any) {
      const href = token && typeof token === 'object' ? token.href : arguments[0]
      const alt = token && typeof token === 'object' ? token.text : arguments[2]
      const h = String(href ?? '').trim()
      // images: allow only http(s) and root/relative; drop javascript:/data: entirely
      const safe = /^(?:https?:|\/|\.\/|\.\.\/)/i.test(h) ? h : ''
      return `<img src="${esc(safe)}" alt="${esc(String(alt ?? ''))}">`
    },
  },
})

export interface ReportMeta {
  title: string
  ticker?: string
  date?: string
  module?: string
  agent?: string
  verdict?: string
  sourcePath: string
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))
}
function titleCase(s: string): string {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function parseMeta(relPath: string): ReportMeta {
  const parts = relPath.split('/')
  const runFolder = parts[1] || ''
  const m = runFolder.match(/^(.+)_(\d{4}-\d{2}-\d{2})$/)
  const ticker = m?.[1]
  const date = m?.[2]
  const last = parts[parts.length - 1] || ''
  let module: string | undefined
  let agent: string | undefined
  let title: string
  if (last.startsWith('final_thesis')) {
    title = `Investment Thesis${ticker ? ` — ${ticker}` : ''}`
  } else if (parts.length >= 4) {
    module = parts[2]
    agent = last.replace(/\.md$/, '').replace(/^\d+_/, '')
    title = `${titleCase(agent)}${ticker ? ` — ${ticker}` : ''}`
  } else {
    title = last.replace(/\.md$/, '')
  }
  return { title, ticker, date, module, agent, sourcePath: relPath }
}

export function safeName(meta: ReportMeta): string {
  const bits = [meta.ticker || 'report', meta.agent || meta.module || 'thesis', meta.date || ''].filter(Boolean)
  return bits.join('_').replace(/[^A-Za-z0-9_\-]/g, '')
}

const CSS = `
  @page { size: A4; margin: 22mm 20mm 20mm; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #f4f3ef; color: #1c1b18;
    font-family: Georgia, "Iowan Old Style", "Times New Roman", serif; font-size: 11.5pt; line-height: 1.62; }
  .page { max-width: 820px; margin: 0 auto; background: #fffdfa; padding: 54px 60px 80px;
    box-shadow: 0 1px 0 rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.12); }
  .wordmark { font-family: -apple-system, "SF Pro Text", Inter, system-ui, sans-serif;
    font-size: 10.5px; letter-spacing: 2.4px; text-transform: uppercase; color: #9a7320; font-weight: 700; }
  .wordmark span { color: #b8b3a7; font-weight: 600; letter-spacing: 1.6px; }
  h1.cover { font-family: -apple-system, "SF Pro Display", Inter, system-ui, sans-serif;
    font-size: 27px; font-weight: 600; letter-spacing: -0.2px; margin: 14px 0 8px; color: #15140f; line-height: 1.15; }
  .metaline { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 10.5px; color: #7c776c; letter-spacing: 0.2px; }
  .verdict { margin-top: 14px; padding: 11px 15px; background: #faf4e6; border: 1px solid #ecd9a8;
    border-left: 3px solid #d6a02e; border-radius: 7px; font-size: 12pt; color: #5d4711;
    font-family: -apple-system, system-ui, sans-serif; }
  .verdict b { font-family: inherit; }
  .rule { height: 1px; background: linear-gradient(90deg, #d6a02e, #e7e3d8 60%, transparent); margin: 22px 0 30px; }
  .doc h1 { font-family: -apple-system, "SF Pro Display", system-ui, sans-serif; font-size: 21px; font-weight: 600; margin: 26px 0 12px; color: #15140f; }
  .doc h2 { font-family: -apple-system, "SF Pro Display", system-ui, sans-serif; font-size: 16.5px; font-weight: 600;
    margin: 30px 0 12px; padding-bottom: 7px; border-bottom: 1px solid #e7e3d8; color: #1c1b18; page-break-after: avoid; }
  .doc h3 { font-family: -apple-system, system-ui, sans-serif; font-size: 13.5px; font-weight: 700; margin: 22px 0 8px; color: #2a281f; page-break-after: avoid; }
  .doc p { margin: 11px 0; }
  .doc em { color: #6a655a; }
  .doc strong { color: #15140f; }
  .doc a { color: #9a7320; text-decoration: none; border-bottom: 1px solid #e3c97e; }
  .doc ul, .doc ol { padding-left: 22px; margin: 11px 0; }
  .doc li { margin: 4px 0; }
  .doc code { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 9.5pt; background: #f1efe8; padding: 1px 5px; border-radius: 4px; }
  .doc pre { background: #f1efe8; padding: 12px 14px; border-radius: 8px; overflow-x: auto; font-size: 9pt; }
  .doc blockquote { border-left: 3px solid #d6a02e; margin: 14px 0; padding: 2px 16px; color: #6a655a; font-style: italic; background: #faf8f1; }
  .doc table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 9.5pt;
    font-family: -apple-system, system-ui, sans-serif; page-break-inside: avoid; }
  .doc th, .doc td { border: 1px solid #e0dccf; padding: 7px 10px; text-align: left; vertical-align: top; }
  .doc th { background: #f6f2e7; font-weight: 600; color: #2a281f; }
  .doc tr:nth-child(even) td { background: #fbfaf5; }
  .doc hr { border: none; border-top: 1px solid #e7e3d8; margin: 24px 0; }
  .foot { margin-top: 40px; padding-top: 14px; border-top: 1px solid #e7e3d8;
    font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 8.5pt; color: #a39d8e; }
  @media print {
    body { background: #fff; }
    .page { box-shadow: none; max-width: none; margin: 0; padding: 0; background: #fff; }
  }
`

export function buildReportHtml(markdown: string, meta: ReportMeta, opts: { print?: boolean } = {}): string {
  const bodyHtml = marked.parse(markdown) as string
  const metaLine = [
    meta.ticker && `Ticker: ${meta.ticker}`,
    meta.module && `Module: ${titleCase(meta.module)}`,
    meta.agent && `Agent: ${meta.agent}`,
    meta.date && `Run: ${meta.date}`,
  ]
    .filter(Boolean)
    .join('   ·   ')
  const verdictBlock = meta.verdict ? `<div class="verdict"><b>Verdict:</b> ${esc(meta.verdict)}</div>` : ''
  const printScript = opts.print ? '<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},350)})</script>' : ''
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(meta.title)}</title><style>${CSS}</style></head>
<body><div class="page">
  <div class="wordmark">Nostradamus Swarm <span>· Equity Research</span></div>
  <h1 class="cover">${esc(meta.title)}</h1>
  <div class="metaline">${esc(metaLine)}</div>
  ${verdictBlock}
  <div class="rule"></div>
  <main class="doc">${bodyHtml}</main>
  <div class="foot">Generated by Nostradamus Swarm${meta.date ? ` · ${esc(meta.date)}` : ''} · source: ${esc(meta.sourcePath)}</div>
</div>${printScript}</body></html>`
}
