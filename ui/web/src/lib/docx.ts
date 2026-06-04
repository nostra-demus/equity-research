// Real .docx generation, fully client-side (no backend, no macOS textutil).
// The markdown is tokenised with `marked` and mapped onto the `docx` object
// model, so the output is a valid Office Open XML document that opens in Word,
// Pages, Google Docs and Quick Look — unlike the old HTML-renamed-to-.doc trick,
// which several of those refuse to open.
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ExternalHyperlink,
  ShadingType,
} from 'docx'
import { marked } from 'marked'
import type { ReportMeta } from './export'

type Tok = any
type RunStyle = { bold?: boolean; italics?: boolean; strike?: boolean; style?: string }

const HEAD: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
  5: HeadingLevel.HEADING_5,
  6: HeadingLevel.HEADING_6,
}

const dec = (s: unknown): string =>
  String(s == null ? '' : s)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')

// Inline markdown tokens -> TextRun[] / hyperlinks.
function runs(toks: Tok[] | undefined, base: RunStyle = {}): any[] {
  const out: any[] = []
  for (const t of toks || []) {
    if (t.type === 'strong') out.push(...runs(t.tokens, { ...base, bold: true }))
    else if (t.type === 'em') out.push(...runs(t.tokens, { ...base, italics: true }))
    else if (t.type === 'del') out.push(...runs(t.tokens, { ...base, strike: true }))
    else if (t.type === 'codespan') out.push(new TextRun({ text: dec(t.text), font: 'Courier New', ...base }))
    else if (t.type === 'br') out.push(new TextRun({ text: '', break: 1 }))
    else if (t.type === 'link')
      out.push(new ExternalHyperlink({ link: t.href, children: runs(t.tokens, { ...base, style: 'Hyperlink' }) }))
    else if (t.tokens && t.tokens.length) out.push(...runs(t.tokens, base))
    else out.push(new TextRun({ text: dec(t.text), ...base }))
  }
  return out.length ? out : [new TextRun({ text: '', ...base })]
}

function pushList(token: Tok, level: number, out: any[]): void {
  token.items.forEach((item: Tok, i: number) => {
    const inline: Tok[] = []
    const nested: Tok[] = []
    for (const t of item.tokens || []) {
      if (t.type === 'list') nested.push(t)
      else if (t.tokens && t.tokens.length) inline.push(...t.tokens)
      else if (t.text) inline.push({ type: 'text', text: t.text })
    }
    const kids: any[] = []
    if (token.ordered) kids.push(new TextRun({ text: `${(token.start || 1) + i}. ` }))
    kids.push(...runs(inline))
    out.push(
      new Paragraph({
        children: kids,
        bullet: token.ordered ? undefined : { level },
        indent: token.ordered ? { left: 360 * (level + 1) } : undefined,
        spacing: { after: 40 },
      })
    )
    nested.forEach((n) => pushList(n, level + 1, out))
  })
}

function buildTable(tok: Tok): Table {
  const b = { style: BorderStyle.SINGLE, size: 4, color: 'E0DCCF' }
  const borders = { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b }
  const headerRow = new TableRow({
    tableHeader: true,
    children: tok.header.map(
      (c: Tok) =>
        new TableCell({
          shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F6F2E7' },
          children: [new Paragraph({ children: runs(c.tokens, { bold: true }) })],
        })
    ),
  })
  const bodyRows = tok.rows.map(
    (r: Tok[]) =>
      new TableRow({
        children: r.map((c) => new TableCell({ children: [new Paragraph({ children: runs(c.tokens) })] })),
      })
  )
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders, rows: [headerRow, ...bodyRows] })
}

// Block markdown tokens -> Paragraphs / Tables.
function blocks(toks: Tok[]): any[] {
  const out: any[] = []
  for (const tok of toks || []) {
    switch (tok.type) {
      case 'heading':
        out.push(new Paragraph({ heading: HEAD[tok.depth] || HeadingLevel.HEADING_6, children: runs(tok.tokens) }))
        break
      case 'paragraph':
        out.push(new Paragraph({ children: runs(tok.tokens), spacing: { after: 120 } }))
        break
      case 'list':
        pushList(tok, 0, out)
        break
      case 'table':
        out.push(buildTable(tok))
        out.push(new Paragraph({ text: '' }))
        break
      case 'code':
        out.push(
          new Paragraph({
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F1EFE8' },
            children: dec(tok.text)
              .split('\n')
              .map((ln, i) => new TextRun({ text: ln, font: 'Courier New', size: 18, break: i ? 1 : undefined })),
          })
        )
        break
      case 'blockquote':
        for (const p of blocks(tok.tokens)) out.push(p)
        break
      case 'hr':
        out.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D6A02E' } }, children: [] }))
        break
      case 'space':
        break
      default:
        if (tok.tokens) out.push(new Paragraph({ children: runs(tok.tokens) }))
        else if (tok.text) out.push(new Paragraph({ text: dec(tok.text) }))
    }
  }
  return out
}

function buildDocument(markdown: string, meta: ReportMeta): Document {
  const tokens = marked.lexer(markdown, { gfm: true }) as Tok[]
  const metaLine = [
    meta.ticker && `Ticker: ${meta.ticker}`,
    meta.module && `Module: ${meta.module}`,
    meta.agent && `Agent: ${meta.agent}`,
    meta.date && `Run: ${meta.date}`,
  ]
    .filter(Boolean)
    .join('    ·    ')

  const cover: any[] = [
    new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: 'NOSTRADAMUS SWARM  ·  EQUITY RESEARCH', bold: true, color: '9A7320', size: 16 })] }),
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: meta.title })] }),
    new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: metaLine, color: '7C776C', size: 18 })] }),
  ]
  if (meta.verdict)
    cover.push(
      new Paragraph({
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'FAF4E6' },
        spacing: { after: 160 },
        children: [new TextRun({ text: 'Verdict: ', bold: true, color: '5D4711' }), new TextRun({ text: meta.verdict, color: '5D4711' })],
      })
    )
  cover.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D6A02E' } }, spacing: { after: 200 }, children: [] }))

  const foot = [
    new Paragraph({
      spacing: { before: 240 },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'E7E3D8' } },
      children: [new TextRun({ text: `Generated by Nostradamus Swarm${meta.date ? ` · ${meta.date}` : ''} · source: ${meta.sourcePath}`, color: 'A39D8E', size: 16 })],
    }),
  ]

  return new Document({
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
    sections: [{ children: [...cover, ...blocks(tokens), ...foot] }],
  })
}

export async function buildDocxBlob(markdown: string, meta: ReportMeta): Promise<Blob> {
  return Packer.toBlob(buildDocument(markdown, meta))
}
