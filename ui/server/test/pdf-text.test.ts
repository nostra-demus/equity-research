// PDF text extraction (news/pdf-text.ts) — the filing-document read's engine. Exchange disclosures
// (ASX/HKEX/NSE/BSE) are PDFs, frequently "encrypted" with an EMPTY user password (edit-restriction
// only); the extractor must read those, refuse really-protected files, decode ToUnicode'd hex text,
// and never let binary noise masquerade as prose. Fixtures are constructed IN the test with node
// crypto/zlib (an independent implementation of the standard security handler), so the module is
// validated against the spec, not against itself.
// Run: npx tsx test/pdf-text.test.ts
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import zlib from 'node:zlib'
import { extractPdfText, hash2B, looksLikePdf, rc4 as rc4Module } from '../src/news/pdf-text'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// ---- the test's OWN rc4 (independent of the module's) ----
function rc4Test(key: Buffer, data: Buffer): Buffer {
  const S = new Uint8Array(256)
  for (let i = 0; i < 256; i++) S[i] = i
  let j = 0
  for (let i = 0; i < 256; i++) { j = (j + S[i] + key[i % key.length]) & 0xff; const t = S[i]; S[i] = S[j]; S[j] = t }
  const out = Buffer.alloc(data.length)
  let a = 0, b = 0
  for (let k = 0; k < data.length; k++) {
    a = (a + 1) & 0xff; b = (b + S[a]) & 0xff
    const t = S[a]; S[a] = S[b]; S[b] = t
    out[k] = data[k] ^ S[(S[a] + S[b]) & 0xff]
  }
  return out
}
const md5 = (...p: Buffer[]) => crypto.createHash('md5').update(Buffer.concat(p)).digest()
const sha256 = (...p: Buffer[]) => crypto.createHash('sha256').update(Buffer.concat(p)).digest()
const PAD = Buffer.from('28bf4e5e4e758a4164004e56fffa01082e2e00b6d0683e802f0ca9fe6453697a', 'hex')

// ---- fixture builders ----

/** A minimal single-page PDF whose content stream is provided verbatim (optionally deflated). */
function buildPdf(contentStream: Buffer, opts: { flate?: boolean; extraObjects?: string; trailerExtra?: string } = {}): Buffer {
  const filter = opts.flate ? '/Filter/FlateDecode' : ''
  const parts =
    `%PDF-1.6\n` +
    `1 0 obj <</Type/Catalog/Pages 2 0 R>> endobj\n` +
    `2 0 obj <</Type/Pages/Kids [3 0 R]/Count 1>> endobj\n` +
    `3 0 obj <</Type/Page/Parent 2 0 R/Contents 4 0 R>> endobj\n` +
    `4 0 obj <<${filter}/Length ${contentStream.length}>>\nstream\n`
  const tail = `\nendstream\nendobj\n${opts.extraObjects || ''}trailer\n<</Size 9/Root 1 0 R${opts.trailerExtra || ''}>>\n%%EOF\n`
  return Buffer.concat([Buffer.from(parts, 'latin1'), contentStream, Buffer.from(tail, 'latin1')])
}

const PROSE = 'Completion did not occur on 1 July 2026 due to a failure by the counterparty to take the required steps.'

await check('plain literal-string Tj text extracts (uncompressed)', () => {
  const content = Buffer.from(`BT /F1 12 Tf (${PROSE}) Tj ET`, 'latin1')
  const t = extractPdfText(buildPdf(content))
  assert.ok(t.includes('Completion did not occur on 1 July 2026'), `got: ${t}`)
})

await check('FlateDecode + TJ array with kerning reads as words with spaces', () => {
  const raw = `BT /F1 12 Tf [(Tri) -20 (ton) -250 (issued) -250 (a) -250 (default) -250 (notice) -250 (today.) ] TJ T* (The deal must complete by Thursday 9 July 2026 or remedies apply at law.) Tj ET`
  const content = zlib.deflateSync(Buffer.from(raw, 'latin1'))
  const t = extractPdfText(buildPdf(content, { flate: true }))
  assert.ok(/Triton issued a default notice today\./.test(t), `kerning becomes word gaps, got: ${t}`)
  assert.ok(t.includes('Thursday 9 July 2026'), 'second line present')
})

await check('hex strings decode through a ToUnicode bfchar/bfrange CMap', () => {
  // glyph codes 0001.. map to "Default notice issued" letters via bfchar
  const textCodes = 'Default notice'
  const codes = [...textCodes].map((_, i) => (i + 1).toString(16).padStart(4, '0')).join('')
  const bfchars = [...textCodes].map((ch, i) => `<${(i + 1).toString(16).padStart(4, '0')}> <${ch.charCodeAt(0).toString(16).padStart(4, '0')}>`).join('\n')
  const cmap = `/CIDInit /ProcSet findresource begin\nbegincmap\nbegincodespacerange\n<0000> <FFFF>\nendcodespacerange\n${textCodes.length} beginbfchar\n${bfchars}\nendbfchar\nendcmap\nend`
  const content = Buffer.from(`BT /F1 12 Tf <${codes}> Tj (Plain literal text also present in this stream for confidence.) Tj ET`, 'latin1')
  const extra = `7 0 obj <</Length ${cmap.length}>>\nstream\n${cmap}\nendstream\nendobj\n`
  const t = extractPdfText(buildPdf(content, { extraObjects: extra }))
  assert.ok(t.includes('Default notice'), `CMap-decoded hex text present, got: ${t}`)
})

await check('AES-256 (R5, empty user password) — the ASX exchange-PDF scheme — decrypts and reads', () => {
  const fileKey = crypto.randomBytes(32)
  const valSalt = crypto.randomBytes(8)
  const keySalt = crypto.randomBytes(8)
  const U = Buffer.concat([sha256(valSalt), valSalt, keySalt]) // sha256('' + valSalt) = the empty-pw check
  const ue = crypto.createCipheriv('aes-256-cbc', sha256(keySalt), Buffer.alloc(16))
  ue.setAutoPadding(false)
  const UE = Buffer.concat([ue.update(fileKey), ue.final()])
  const O = crypto.randomBytes(48)
  const OE = crypto.randomBytes(32)
  const iv = crypto.randomBytes(16)
  const enc = crypto.createCipheriv('aes-256-cbc', fileKey, iv)
  const cipher = Buffer.concat([iv, enc.update(zlib.deflateSync(Buffer.from(`BT (${PROSE}) Tj ET`, 'latin1'))), enc.final()])
  const hx = (b: Buffer) => `<${b.toString('hex')}>`
  const extra = `9 0 obj <</Filter/Standard/V 5/R 5/Length 256/P -540/U ${hx(U)}/UE ${hx(UE)}/O ${hx(O)}/OE ${hx(OE)}/StrF/StdCF/StmF/StdCF/CF<</StdCF<</CFM/AESV3/Length 32>>>>>> endobj\n`
  const pdf = buildPdf(cipher, { flate: true, extraObjects: extra, trailerExtra: '/Encrypt 9 0 R/ID [<b9deb8cf> <b9deb8cf>]' })
  const t = extractPdfText(pdf)
  assert.ok(t.includes('Completion did not occur on 1 July 2026'), `decrypted text present, got: ${t}`)
})

await check('AES-256 (R5) with a REAL user password is refused — we never guess-decrypt', () => {
  const fileKey = crypto.randomBytes(32)
  const valSalt = crypto.randomBytes(8)
  const keySalt = crypto.randomBytes(8)
  const pw = Buffer.from('secret')
  const U = Buffer.concat([sha256(pw, valSalt), valSalt, keySalt]) // validates only WITH the password
  const ue = crypto.createCipheriv('aes-256-cbc', sha256(pw, keySalt), Buffer.alloc(16))
  ue.setAutoPadding(false)
  const UE = Buffer.concat([ue.update(fileKey), ue.final()])
  const iv = crypto.randomBytes(16)
  const enc = crypto.createCipheriv('aes-256-cbc', fileKey, iv)
  const cipher = Buffer.concat([iv, enc.update(zlib.deflateSync(Buffer.from(`BT (${PROSE}) Tj ET`, 'latin1'))), enc.final()])
  const hx = (b: Buffer) => `<${b.toString('hex')}>`
  const extra = `9 0 obj <</Filter/Standard/V 5/R 5/Length 256/P -540/U ${hx(U)}/UE ${hx(UE)}/O ${hx(crypto.randomBytes(48))}/OE ${hx(crypto.randomBytes(32))}>> endobj\n`
  const pdf = buildPdf(cipher, { flate: true, extraObjects: extra, trailerExtra: '/Encrypt 9 0 R/ID [<aa> <aa>]' })
  assert.equal(extractPdfText(pdf), '', 'password-protected file yields no text')
})

await check('RC4 128-bit (V2/R3, empty user password) decrypts and reads', () => {
  const id0 = crypto.randomBytes(16)
  const O = crypto.randomBytes(32)
  const P = -540
  const pBuf = Buffer.alloc(4)
  pBuf.writeInt32LE(P, 0)
  const n = 16
  let key = md5(PAD, O, pBuf, id0).subarray(0, n)
  for (let i = 0; i < 50; i++) key = md5(key.subarray(0, n)).subarray(0, n)
  // U per Algorithm 5 (what a writer would emit for the empty user password)
  let x = md5(PAD, id0)
  x = rc4Test(key, x)
  for (let i = 1; i <= 19; i++) {
    const k2 = Buffer.from(key)
    for (let j = 0; j < k2.length; j++) k2[j] ^= i
    x = rc4Test(k2, x)
  }
  const U = Buffer.concat([x, crypto.randomBytes(16)])
  // stream for object 4 0: per-object key = md5(fileKey + num3LE + gen2LE)[0..16]
  const numBuf = Buffer.alloc(5)
  numBuf.writeUIntLE(4, 0, 3)
  numBuf.writeUIntLE(0, 3, 2)
  const objKey = md5(key, numBuf).subarray(0, Math.min(n + 5, 16))
  const cipher = rc4Test(objKey, zlib.deflateSync(Buffer.from(`BT (${PROSE}) Tj ET`, 'latin1')))
  const hx = (b: Buffer) => `<${b.toString('hex')}>`
  const extra = `9 0 obj <</Filter/Standard/V 2/R 3/Length 128/P ${P}/U ${hx(U)}/O ${hx(O)}>> endobj\n`
  const pdf = buildPdf(cipher, { flate: true, extraObjects: extra, trailerExtra: `/Encrypt 9 0 R/ID [${hx(id0)} ${hx(id0)}]` })
  const t = extractPdfText(pdf)
  assert.ok(t.includes('Completion did not occur on 1 July 2026'), `RC4-decrypted text present, got: ${t}`)
})

await check('module rc4 matches the independent implementation', () => {
  const key = crypto.randomBytes(16)
  const data = crypto.randomBytes(333)
  assert.deepEqual(rc4Module(key, data), rc4Test(key, data))
})

await check('hash2B (R6 iterated hash) is deterministic and 32 bytes', () => {
  const a = hash2B(Buffer.alloc(0), Buffer.from('saltsalt'), Buffer.alloc(0))
  const b = hash2B(Buffer.alloc(0), Buffer.from('saltsalt'), Buffer.alloc(0))
  assert.equal(a.length, 32)
  assert.deepEqual(a, b)
})

await check('symbol-soup lines (a remapped subset font with no usable ToUnicode) are dropped, not emitted', () => {
  const soup = `BT (!"#$%&) Tj T* (')*&+#$$,%&-.,,#/0&!$1%%$) Tj T* (${PROSE}) Tj ET`
  const t = extractPdfText(buildPdf(Buffer.from(soup, 'latin1')))
  assert.ok(t.includes('Completion did not occur'), 'real prose kept')
  assert.ok(!t.includes('#$$,%'), `glyph noise dropped, got: ${t}`)
})

await check('REVIEW FIX: two disagreeing font CMaps → the hex string is DROPPED, never decoded to wrong letters', () => {
  // font A maps codes 3,4 → "AB"; font B maps the SAME codes → "XY". Without per-font tracking the
  // decode is ambiguous — emitting either would risk presenting wrong words as the filing text (§3).
  const mkCmap = (pairs: [number, string][]) =>
    `/CIDInit /ProcSet findresource begin\nbegincmap\nbegincodespacerange\n<0000> <FFFF>\nendcodespacerange\n${pairs.length} beginbfchar\n` +
    pairs.map(([c, ch]) => `<${c.toString(16).padStart(4, '0')}> <${ch.charCodeAt(0).toString(16).padStart(4, '0')}>`).join('\n') +
    `\nendbfchar\nendcmap\nend`
  const cmapA = mkCmap([[3, 'A'], [4, 'B']])
  const cmapB = mkCmap([[3, 'X'], [4, 'Y']])
  const content = Buffer.from(`BT /F2 12 Tf <00030004> Tj (${PROSE}) Tj ET`, 'latin1')
  const extra =
    `7 0 obj <</Length ${cmapA.length}>>\nstream\n${cmapA}\nendstream\nendobj\n` +
    `8 0 obj <</Length ${cmapB.length}>>\nstream\n${cmapB}\nendstream\nendobj\n`
  const t = extractPdfText(buildPdf(content, { extraObjects: extra }))
  assert.ok(t.includes('Completion did not occur'), 'literal prose kept')
  assert.ok(!/\bAB\b/.test(t) && !/\bXY\b/.test(t), `ambiguous hex must be dropped, got: ${t}`)
})

await check('REVIEW FIX: agreeing CMaps still decode (agreement rule keeps real text)', () => {
  const mk = () =>
    `/CIDInit /ProcSet findresource begin\nbegincmap\nbegincodespacerange\n<0000> <FFFF>\nendcodespacerange\n2 beginbfchar\n<0003> <0048>\n<0004> <0069>\nendbfchar\nendcmap\nend`
  const cmap1 = mk(), cmap2 = mk()
  const content = Buffer.from(`BT <00030004> Tj (${PROSE}) Tj ET`, 'latin1')
  const extra = `7 0 obj <</Length ${cmap1.length}>>\nstream\n${cmap1}\nendstream\nendobj\n8 0 obj <</Length ${cmap2.length}>>\nstream\n${cmap2}\nendstream\nendobj\n`
  const t = extractPdfText(buildPdf(content, { extraObjects: extra }))
  assert.ok(t.includes('Hi'), `agreed decode kept, got: ${t.slice(0, 80)}`)
})

await check('REVIEW FIX: a bfrange-spam CMap (wide ranges repeated) is work-capped — no event-loop stall', () => {
  // 5,000 identical <0000><FFFF> ranges = ~3.3e8 iterations unfixed (~8s+); capped it must return fast.
  const ranges = new Array(5000).fill('<0000> <ffff> <0041>').join('\n')
  const cmap = `/CIDInit /ProcSet findresource begin\nbegincmap\n1 beginbfrange\n${ranges}\nendbfrange\nendcmap\nend`
  const content = Buffer.from(`BT (${PROSE}) Tj ET`, 'latin1')
  const extra = `7 0 obj <</Length ${cmap.length}>>\nstream\n${cmap}\nendstream\nendobj\n`
  const t0 = Date.now()
  const t = extractPdfText(buildPdf(content, { extraObjects: extra }))
  const elapsed = Date.now() - t0
  assert.ok(elapsed < 3000, `must be work-capped, took ${elapsed}ms`)
  assert.ok(t.includes('Completion did not occur'), 'the document still reads')
})

await check('non-PDF bytes, oversized input, and an image-only scan all yield the empty string', () => {
  assert.equal(extractPdfText(Buffer.from('not a pdf at all, just text pretending')), '')
  assert.equal(looksLikePdf(Buffer.from('%PDF-1.4\n' + 'x'.repeat(200))), true)
  const content = Buffer.from(`BT (hi) Tj ET`, 'latin1') // too few letters to be a document
  assert.equal(extractPdfText(buildPdf(content)), '')
  const big = buildPdf(Buffer.from(`BT (${PROSE}) Tj ET`, 'latin1'))
  assert.equal(extractPdfText(big, { maxBytes: 10 }), '', 'over the byte cap → refused')
})

await check('output honours the maxChars cap', () => {
  const long = `BT (${PROSE.repeat(30)}) Tj ET`
  const t = extractPdfText(buildPdf(Buffer.from(long, 'latin1')), { maxChars: 500 })
  assert.ok(t.length <= 500 && t.length > 400)
})

console.log(`\npdf-text: ${passed} checks passed${process.exitCode ? ' (WITH FAILURES)' : ''}`)
