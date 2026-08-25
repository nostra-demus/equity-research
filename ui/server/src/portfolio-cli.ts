// Build a book from one or more Flex XML exports and print whether it reconciles.
//
// PR 1 ships no screen on purpose: the parsing and the lot matching have to be proven against a real
// statement before any UI depends on them. This is how you prove it.
//
//   npx tsx src/portfolio-cli.ts ~/Downloads/fund_book.xml [more.xml ...]
//
// Reads only. Writes nothing, uploads nothing, and prints to the operator's own terminal — the
// statement never leaves the machine. Exit code is 1 when the book does not reconcile, so it can also
// be used as a check rather than only read by eye.

import fs from 'node:fs'
import { buildBook } from './portfolio'
import { parseFlexXml } from './portfolio-import'

function money(v: number | null, currency: string | null): string {
  if (v === null) return '—'
  const sign = v < 0 ? '−' : ''
  return `${sign}${currency ?? ''}${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function main(argv: string[]): number {
  const paths = argv.filter((a) => !a.startsWith('-'))
  if (paths.length === 0) {
    console.error('usage: npx tsx src/portfolio-cli.ts <flex.xml> [more.xml ...]')
    return 2
  }

  const docs = paths.map((p) => {
    const xml = fs.readFileSync(p, 'utf8')
    try {
      return parseFlexXml(xml)
    } catch (e: any) {
      throw new Error(`${p}: ${e?.message || e}`)
    }
  })

  const book = buildBook(docs)
  const ccy = book.baseCurrency

  console.log('')
  console.log(`ACCOUNT   ${book.accountId ?? '(none)'}   base ${ccy ?? '?'}`)
  console.log(`COVERAGE  ${book.coverage.from ?? '?'} → ${book.coverage.to ?? '?'}   ${book.coverage.documents} document(s)   as of ${book.asOf ?? '?'}`)
  console.log(`SECTIONS  ${book.sectionsPresent.join(', ') || '(none)'}`)
  console.log('')
  console.log(`POSITIONS ${book.positions.length}   (${book.positions.filter((p) => p.isDerivative).length} derivative — notional is exposure, not a NAV weight)`)
  console.log(`OPEN LOTS ${book.openLots.length}`)
  console.log(`CLOSURES  ${book.closures.length}   realised ${money(book.closures.reduce((a, c) => a + (c.realizedBase ?? c.realizedLocal), 0), ccy)}`)
  console.log(`FLOWS     ${book.flows.length}   net ${money(book.flows.reduce((a, f) => a + (f.amountBase ?? f.amount), 0), ccy)}`)
  console.log(`CORP ACTS ${book.corporateActions.length}`)
  console.log('')
  console.log('INCOME')
  console.log(`  dividends (gross)   ${money(book.income.dividendsGross, ccy)}`)
  console.log(`  withholding tax     ${money(book.income.withholdingTax, ccy)}`)
  console.log(`  payment in lieu     ${money(book.income.paymentInLieu, ccy)}`)
  console.log(`  interest            ${money(book.income.interest, ccy)}`)
  console.log(`  fees                ${money(book.income.fees, ccy)}`)
  console.log(`  net                 ${money(book.income.net, ccy)}`)
  console.log('')
  console.log(`RETURN    time-weighted ${book.twr === null ? '—' : book.twr.toFixed(2) + '%'}   over ${book.navSeries.length} daily NAV points`)
  console.log('')
  console.log('RECONCILIATION')
  if (book.reconciliation.checks.length === 0) {
    console.log('  (nothing to check — the query carried no ChangeInNAV section)')
  }
  for (const c of book.reconciliation.checks) {
    const mark = c.ok ? 'ok  ' : 'BREAK'
    const brk = c.break === null ? '—' : c.break.toFixed(4)
    console.log(`  ${mark} ${c.name.padEnd(22)} ours ${String(c.ours?.toFixed(2) ?? '—').padStart(14)}   broker ${String(c.broker?.toFixed(2) ?? '—').padStart(14)}   break ${brk}`)
    if (!c.ok) console.log(`        ${c.detail} (tolerance ${c.tolerance})`)
  }
  console.log('')
  if (book.warnings.length) {
    console.log('WARNINGS')
    for (const w of book.warnings) console.log(`  · ${w}`)
    console.log('')
  }
  console.log(book.reconciliation.ok ? 'BOOK RECONCILES' : 'BOOK DOES NOT RECONCILE')
  console.log('')
  return book.reconciliation.ok ? 0 : 1
}

// exitCode, not exit(): process.exit() can truncate piped stdout mid-flush, and the line most likely
// to be lost is the last one — the reconciliation verdict.
process.exitCode = main(process.argv.slice(2))
