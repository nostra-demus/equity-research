// IBKR Activity Flex XML → typed sections. The reading half of the fund book.
//
// WHY A HAND-WRITTEN PARSER. The server carries 14 dependencies and no XML library. An Activity Flex
// export is a deliberately narrow shape — elements carrying attributes only, no mixed content, no
// namespaces, no CDATA inside the data rows — so a purpose-built reader is ~100 lines, adds no supply
// chain, and can be tested against the exact cases that break naive parsing. It is strict on purpose:
// anything it does not recognise throws rather than being silently mis-read, because a quietly wrong
// trade is far more expensive here than a failed import.
//
// TWO RULES THAT MATTER MORE THAN THEY LOOK:
//
//  1. AN EMPTY ATTRIBUTE IS null, NEVER 0. IBKR writes "" for a field that does not apply to a row
//     (no commission on a corporate action, no fxRateToBase on a base-currency row). Coercing those to
//     0 makes them silently join sums as real zeros — a whole class of "the numbers almost tie" bugs.
//     `num()` returns null, and every caller decides what an absent value means.
//
//  2. DATE FORMAT IS A QUERY SETTING, NOT A CONSTANT. The same query can emit `20260825` or
//     `2026-08-25` depending on how the operator configured it, and timestamps arrive as
//     `20260825;143005` or `2026-08-25 14:30:05`. Both are accepted and normalised to ISO, so a
//     re-configured query never silently produces unparseable dates.
//
// The parser is PURE: string in, data out. No filesystem, no clock, no I/O — so it is cheap to test
// and impossible for it to touch the book by accident.

// ---------- minimal XML ----------

interface XmlNode {
  tag: string
  attrs: Record<string, string>
  children: XmlNode[]
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }

/** A numeric entity outside the Unicode range is left as written rather than thrown. `&#999999999;`
 *  in one description must not abort an entire statement — the raw text is strictly better than no
 *  import at all. */
function fromCodePoint(code: number, whole: string): string {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return whole
  try { return String.fromCodePoint(code) } catch { return whole }
}

function decodeEntities(s: string): string {
  if (!s.includes('&')) return s // the overwhelmingly common case — skip the regex entirely
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (whole, body: string) => {
    if (body.startsWith('#x') || body.startsWith('#X')) return fromCodePoint(Number.parseInt(body.slice(2), 16), whole)
    if (body.startsWith('#')) return fromCodePoint(Number.parseInt(body.slice(1), 10), whole)
    const named = ENTITIES[body.toLowerCase()]
    return named === undefined ? whole : named
  })
}

/** Read one tag starting just after its '<'. Quote-aware: a '>' inside an attribute value (a company
 *  description can carry one) must not be mistaken for the end of the tag. */
function readTag(src: string, from: number): { tag: string; attrs: Record<string, string>; end: number; selfClosing: boolean } {
  let i = from
  const nameStart = i
  while (i < src.length && !/[\s/>]/.test(src[i]!)) i++
  const tag = src.slice(nameStart, i)
  if (!tag) throw new Error(`malformed tag at offset ${from}`)
  const attrs: Record<string, string> = {}
  for (;;) {
    while (i < src.length && /\s/.test(src[i]!)) i++
    if (i >= src.length) throw new Error(`unterminated tag <${tag}>`)
    if (src[i] === '/') {
      while (i < src.length && src[i] !== '>') i++
      return { tag, attrs, end: i + 1, selfClosing: true }
    }
    if (src[i] === '>') return { tag, attrs, end: i + 1, selfClosing: false }
    const attrStart = i
    while (i < src.length && src[i] !== '=' && !/[\s>]/.test(src[i]!)) i++
    const name = src.slice(attrStart, i)
    while (i < src.length && /\s/.test(src[i]!)) i++
    if (src[i] !== '=') { attrs[name] = ''; continue } // valueless attribute — accept, don't crash
    i++
    while (i < src.length && /\s/.test(src[i]!)) i++
    const quote = src[i]
    if (quote !== '"' && quote !== "'") throw new Error(`unquoted value for attribute ${name} in <${tag}>`)
    i++
    const valueStart = i
    while (i < src.length && src[i] !== quote) i++
    if (i >= src.length) throw new Error(`unterminated value for attribute ${name} in <${tag}>`)
    attrs[name] = decodeEntities(src.slice(valueStart, i))
    i++
  }
}

/** Parse the document into a node tree. Text content is discarded — Flex data rows carry none. */
export function parseXml(src: string): XmlNode {
  const root: XmlNode = { tag: '#document', attrs: {}, children: [] }
  const stack: XmlNode[] = [root]
  let i = 0
  while (i < src.length) {
    const lt = src.indexOf('<', i)
    if (lt < 0) break
    i = lt + 1
    if (src.startsWith('?', i)) { const e = src.indexOf('?>', i); i = e < 0 ? src.length : e + 2; continue }
    if (src.startsWith('!--', i)) { const e = src.indexOf('-->', i); i = e < 0 ? src.length : e + 3; continue }
    if (src.startsWith('!', i)) { const e = src.indexOf('>', i); i = e < 0 ? src.length : e + 1; continue }
    if (src.startsWith('/', i)) {
      const e = src.indexOf('>', i)
      if (e < 0) throw new Error('unterminated closing tag')
      const name = src.slice(i + 1, e).trim()
      // Tolerate a stray close (a truncated download) rather than losing everything parsed so far.
      for (let d = stack.length - 1; d > 0; d--) {
        if (stack[d]!.tag === name) { stack.length = d; break }
      }
      i = e + 1
      continue
    }
    const { tag, attrs, end, selfClosing } = readTag(src, i)
    const node: XmlNode = { tag, attrs, children: [] }
    stack[stack.length - 1]!.children.push(node)
    if (!selfClosing) stack.push(node)
    i = end
  }
  return root
}

function findAll(node: XmlNode, tag: string, out: XmlNode[] = []): XmlNode[] {
  for (const child of node.children) {
    if (child.tag === tag) out.push(child)
    else findAll(child, tag, out)
  }
  return out
}

function findFirst(node: XmlNode, tag: string): XmlNode | null {
  for (const child of node.children) {
    if (child.tag === tag) return child
    const deeper = findFirst(child, tag)
    if (deeper) return deeper
  }
  return null
}

/** The attribute maps of a section container's rows, e.g. every <Trade> under <Trades>.
 *  Aggregates across EVERY matching container: a multi-statement export repeats each section once per
 *  statement, and reading only the first drops every later account's rows without a word. */
function rowsOf(root: XmlNode, container: string): Record<string, string>[] {
  return findAll(root, container).flatMap((node) => node.children.map((c) => c.attrs))
}

// ---------- coercion ----------

/** "" / "-" / "N/A" → null. NEVER 0 — see rule 1 in the header. */
export function num(v: string | undefined): number | null {
  if (v === undefined) return null
  const t = v.trim()
  if (t === '' || t === '-' || t === '--' || t.toUpperCase() === 'N/A') return null
  const n = Number(t.replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

function str(v: string | undefined): string | null {
  if (v === undefined) return null
  const t = v.trim()
  return t === '' ? null : t
}

/** `20260825` or `2026-08-25` → `2026-08-25`. Anything else → null. */
export function isoDate(v: string | undefined): string | null {
  const t = str(v)
  if (!t) return null
  const compact = /^(\d{4})(\d{2})(\d{2})$/.exec(t)
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`
  const dashed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
  if (dashed) return t
  return null
}

/** `20260825;143005`, `20260825 143005` or `2026-08-25 14:30:05` → `2026-08-25T14:30:05`. */
export function isoDateTime(v: string | undefined): string | null {
  const t = str(v)
  if (!t) return null
  const [datePart, timePartRaw] = t.split(/[;\s]+/, 2)
  const date = isoDate(datePart)
  if (!date) return null
  if (!timePartRaw) return date
  const compact = /^(\d{2})(\d{2})(\d{2})$/.exec(timePartRaw)
  if (compact) return `${date}T${compact[1]}:${compact[2]}:${compact[3]}`
  const colons = /^(\d{2}):(\d{2}):(\d{2})$/.exec(timePartRaw)
  if (colons) return `${date}T${timePartRaw}`
  return date
}

// ---------- typed sections ----------

export interface FlexTrade {
  tradeID: string | null
  transactionID: string | null
  symbol: string | null
  conid: string | null
  assetCategory: string | null
  subCategory: string | null
  currency: string | null
  fxRateToBase: number | null
  quantity: number | null
  tradePrice: number | null
  tradeDate: string | null
  dateTime: string | null
  proceeds: number | null
  ibCommission: number | null
  taxes: number | null
  netCash: number | null
  cost: number | null
  buySell: string | null
  openCloseIndicator: string | null
  fifoPnlRealized: number | null
  mtmPnl: number | null
  multiplier: number | null
  exchange: string | null
  transactionType: string | null
  levelOfDetail: string | null
  // Corporate actions RESTATE trades. These carry the pre-restatement original, which is the only way
  // to follow a lot across a split without guessing.
  origTradeID: string | null
  origTradePrice: number | null
  origTransactionID: string | null
}

export interface FlexOpenPosition {
  symbol: string | null
  conid: string | null
  assetCategory: string | null
  subCategory: string | null
  currency: string | null
  fxRateToBase: number | null
  position: number | null
  markPrice: number | null
  positionValue: number | null
  costBasisPrice: number | null
  costBasisMoney: number | null
  fifoPnlUnrealized: number | null
  percentOfNAV: number | null
  multiplier: number | null
  openDateTime: string | null
  reportDate: string | null
  levelOfDetail: string | null
  expiry: string | null
}

export interface FlexCashTransaction {
  transactionID: string | null
  type: string | null
  symbol: string | null
  currency: string | null
  fxRateToBase: number | null
  amount: number | null
  dateTime: string | null
  settleDate: string | null
  description: string | null
  assetCategory: string | null
}

export interface FlexCorporateAction {
  transactionID: string | null
  actionID: string | null
  type: string | null
  code: string | null
  symbol: string | null
  currency: string | null
  fxRateToBase: number | null
  quantity: number | null
  proceeds: number | null
  value: number | null
  costBasis: number | null
  fifoPnlRealized: number | null
  dateTime: string | null
  reportDate: string | null
  actionDescription: string | null
}

/** The statement's own summary of how NAV moved — including IBKR's own time-weighted return, which is
 *  what our computed return gets reconciled against. */
export interface FlexChangeInNav {
  currency: string | null
  fromDate: string | null
  toDate: string | null
  startingValue: number | null
  endingValue: number | null
  twr: number | null
  realized: number | null
  changeInUnrealized: number | null
  mtm: number | null
  dividends: number | null
  withholdingTax: number | null
  interest: number | null
  commissions: number | null
  otherFees: number | null
  depositsWithdrawals: number | null
  fxTranslation: number | null
  changeInDividendAccruals: number | null
  changeInInterestAccruals: number | null
}

/** One row PER DAY — the daily NAV series every risk metric needs, free with the export. */
export interface FlexEquitySummaryRow {
  reportDate: string | null
  currency: string | null
  cash: number | null
  stock: number | null
  commodities: number | null
  options: number | null
  bonds: number | null
  funds: number | null
  crypto: number | null
  dividendAccruals: number | null
  interestAccruals: number | null
  total: number | null
}

export interface FlexConversionRate {
  reportDate: string | null
  fromCurrency: string | null
  toCurrency: string | null
  rate: number | null
}

export interface FlexDocument {
  accountId: string | null
  /** Every account the file covers. A Flex export may carry more than one <FlexStatement>, and reading
   *  only the first silently drops the rest — half the trades, with nothing to indicate it happened. */
  accountIds: string[]
  fromDate: string | null
  toDate: string | null
  whenGenerated: string | null
  /** Which sections the query emitted that this importer models — an absent section is a
   *  query-configuration fact the importer must report, not silently treat as "nothing happened". */
  sectionsPresent: string[]
  /** Sections the statement carries that this importer does NOT model yet (the accrual sections, for
   *  example). Surfaced rather than dropped: silently ignoring part of a statement is how a book ends
   *  up confidently missing something the broker actually sent. */
  sectionsUnmodelled: string[]
  trades: FlexTrade[]
  openPositions: FlexOpenPosition[]
  cashTransactions: FlexCashTransaction[]
  corporateActions: FlexCorporateAction[]
  changeInNav: FlexChangeInNav | null
  equitySummary: FlexEquitySummaryRow[]
  conversionRates: FlexConversionRate[]
}

const KNOWN_SECTIONS = [
  'EquitySummaryInBase', 'ChangeInNAV', 'OpenPositions', 'Trades',
  'CorporateActions', 'CashTransactions', 'SecuritiesInfo', 'ConversionRates',
]

export function parseFlexXml(xml: string): FlexDocument {
  if (typeof xml !== 'string' || !xml.trim()) throw new Error('empty Flex document')
  const root = parseXml(xml)
  const response = findFirst(root, 'FlexQueryResponse')
  if (!response) throw new Error('not a Flex query response — <FlexQueryResponse> not found')
  const statements = findAll(response, 'FlexStatement')
  if (statements.length === 0) throw new Error('Flex response carries no <FlexStatement>')
  // Rows are read from EVERY statement. A single synthetic root lets the section readers below stay
  // unchanged while still seeing all of them; per-statement identity is preserved in accountIds.
  const statement: XmlNode = statements.length === 1
    ? statements[0]!
    : { tag: 'FlexStatement', attrs: statements[statements.length - 1]!.attrs, children: statements.flatMap((s) => s.children) }

  const navNodes = findAll(statement, 'ChangeInNAV')
  const nav = navNodes.length ? navNodes[navNodes.length - 1]! : null
  const sectionsPresent = KNOWN_SECTIONS.filter((s) => findFirst(statement, s) !== null)
  const sectionsUnmodelled = statement.children
    .map((c) => c.tag)
    .filter((tag, i, all) => !KNOWN_SECTIONS.includes(tag) && all.indexOf(tag) === i)

  return {
    accountId: str(statement.attrs.accountId),
    accountIds: [...new Set(statements.map((s) => str(s.attrs.accountId)).filter((a): a is string => !!a))],
    fromDate: statements.map((s) => isoDate(s.attrs.fromDate)).filter((d): d is string => !!d).sort()[0] ?? null,
    toDate: statements.map((s) => isoDate(s.attrs.toDate)).filter((d): d is string => !!d).sort().reverse()[0] ?? null,
    whenGenerated: isoDateTime(statement.attrs.whenGenerated),
    sectionsPresent,
    sectionsUnmodelled,

    trades: rowsOf(statement, 'Trades').map((a) => ({
      tradeID: str(a.tradeID),
      transactionID: str(a.transactionID),
      symbol: str(a.symbol),
      conid: str(a.conid),
      assetCategory: str(a.assetCategory),
      subCategory: str(a.subCategory),
      currency: str(a.currency),
      fxRateToBase: num(a.fxRateToBase),
      quantity: num(a.quantity),
      tradePrice: num(a.tradePrice),
      tradeDate: isoDate(a.tradeDate),
      dateTime: isoDateTime(a.dateTime),
      proceeds: num(a.proceeds),
      ibCommission: num(a.ibCommission),
      taxes: num(a.taxes),
      netCash: num(a.netCash),
      cost: num(a.cost),
      buySell: str(a.buySell),
      openCloseIndicator: str(a.openCloseIndicator),
      fifoPnlRealized: num(a.fifoPnlRealized),
      mtmPnl: num(a.mtmPnl),
      multiplier: num(a.multiplier),
      exchange: str(a.exchange),
      transactionType: str(a.transactionType),
      levelOfDetail: str(a.levelOfDetail),
      origTradeID: str(a.origTradeID),
      origTradePrice: num(a.origTradePrice),
      origTransactionID: str(a.origTransactionID),
    })),

    openPositions: rowsOf(statement, 'OpenPositions').map((a) => ({
      symbol: str(a.symbol),
      conid: str(a.conid),
      assetCategory: str(a.assetCategory),
      subCategory: str(a.subCategory),
      currency: str(a.currency),
      fxRateToBase: num(a.fxRateToBase),
      position: num(a.position),
      markPrice: num(a.markPrice),
      positionValue: num(a.positionValue),
      costBasisPrice: num(a.costBasisPrice),
      costBasisMoney: num(a.costBasisMoney),
      fifoPnlUnrealized: num(a.fifoPnlUnrealized),
      percentOfNAV: num(a.percentOfNAV),
      multiplier: num(a.multiplier),
      openDateTime: isoDateTime(a.openDateTime),
      reportDate: isoDate(a.reportDate),
      levelOfDetail: str(a.levelOfDetail),
      expiry: isoDate(a.expiry),
    })),

    cashTransactions: rowsOf(statement, 'CashTransactions').map((a) => ({
      transactionID: str(a.transactionID),
      type: str(a.type),
      symbol: str(a.symbol),
      currency: str(a.currency),
      fxRateToBase: num(a.fxRateToBase),
      amount: num(a.amount),
      dateTime: isoDateTime(a.dateTime),
      settleDate: isoDate(a.settleDate),
      description: str(a.description),
      assetCategory: str(a.assetCategory),
    })),

    corporateActions: rowsOf(statement, 'CorporateActions').map((a) => ({
      transactionID: str(a.transactionID),
      actionID: str(a.actionID),
      type: str(a.type),
      code: str(a.code),
      symbol: str(a.symbol),
      currency: str(a.currency),
      fxRateToBase: num(a.fxRateToBase),
      quantity: num(a.quantity),
      proceeds: num(a.proceeds),
      value: num(a.value),
      costBasis: num(a.costBasis),
      fifoPnlRealized: num(a.fifoPnlRealized),
      dateTime: isoDateTime(a.dateTime),
      reportDate: isoDate(a.reportDate),
      actionDescription: str(a.actionDescription),
    })),

    // ChangeInNAV carries its values as attributes on the element ITSELF, not as child rows.
    changeInNav: nav
      ? {
          currency: str(nav.attrs.currency),
          fromDate: isoDate(nav.attrs.fromDate),
          toDate: isoDate(nav.attrs.toDate),
          startingValue: num(nav.attrs.startingValue),
          endingValue: num(nav.attrs.endingValue),
          twr: num(nav.attrs.twr),
          realized: num(nav.attrs.realized),
          changeInUnrealized: num(nav.attrs.changeInUnrealized),
          mtm: num(nav.attrs.mtm),
          dividends: num(nav.attrs.dividends),
          withholdingTax: num(nav.attrs.withholdingTax),
          interest: num(nav.attrs.interest),
          commissions: num(nav.attrs.commissions),
          otherFees: num(nav.attrs.otherFees),
          depositsWithdrawals: num(nav.attrs.depositsWithdrawals),
          fxTranslation: num(nav.attrs.fxTranslation),
          changeInDividendAccruals: num(nav.attrs.changeInDividendAccruals),
          changeInInterestAccruals: num(nav.attrs.changeInInterestAccruals),
        }
      : null,

    equitySummary: rowsOf(statement, 'EquitySummaryInBase').map((a) => ({
      reportDate: isoDate(a.reportDate),
      currency: str(a.currency),
      cash: num(a.cash),
      stock: num(a.stock),
      commodities: num(a.commodities),
      options: num(a.options),
      bonds: num(a.bonds),
      funds: num(a.funds),
      crypto: num(a.crypto),
      dividendAccruals: num(a.dividendAccruals),
      interestAccruals: num(a.interestAccruals),
      total: num(a.total),
    })),

    conversionRates: rowsOf(statement, 'ConversionRates').map((a) => ({
      reportDate: isoDate(a.reportDate),
      fromCurrency: str(a.fromCurrency),
      toCurrency: str(a.toCurrency),
      rate: num(a.rate),
    })),
  }
}
