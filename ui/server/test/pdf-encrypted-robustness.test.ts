// Regression: an AES-256 (R5, empty-user-password) exchange PDF must extract regardless of which random
// byte values fall out of key generation. The sibling pdf-text.test.ts builds ONE such PDF from fresh
// crypto.randomBytes each run, so two independent robustness bugs surfaced only stochastically (~7% of
// CI runs → the "AES-256 (R5) … decrypts and reads" flake). These fixtures make each bug DETERMINISTIC.
//
// Bug 1 — the file-key unwrap (dominant, 16/256 ≈ 6.25%). ISO 32000-2 Algorithm 2.A unwraps the 32-byte
// file encryption key from /UE with AES-256-CBC and NO padding. The extractor's shared CBC helper used
// to PKCS#7-strip unconditionally, so whenever the key's own last byte was in 1..16 it lopped that many
// bytes off, the key read short, and the whole file was wrongly rejected as unsupported → '' text.
//
// Bug 2 — the stream EOL strip (~1/256 per byte). PDF 32000-1 §7.3.8.1 puts a SINGLE end-of-line marker
// between the stream data and `endstream`; it is not part of the data, and /Length gives the exact byte
// count. The extractor used to GREEDILY strip every trailing 0x0a/0x0d, eating a genuine final data byte
// whenever the (binary) stream ended in one — breaking AES-CBC alignment or truncating the inflate input.
//
// Expected values are pinned to the spec (the declared /Length bytes and the 32-byte key must survive
// intact), never to the module's own output. Each case is red on the pre-fix code, green after.
// Run: npx tsx test/pdf-encrypted-robustness.test.ts
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import zlib from 'node:zlib'
import { extractPdfText } from '../src/news/pdf-text'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const sha256 = (...p: Buffer[]) => crypto.createHash('sha256').update(Buffer.concat(p)).digest()
const PROSE = 'Completion did not occur on 1 July 2026 due to a failure by the counterparty to take the required steps.'

// Same minimal single-page builder as pdf-text.test.ts: writes `stream\n<bytes>\nendstream` with /Length.
function buildPdf(contentStream: Buffer, opts: { flate?: boolean; extraObjects?: string; trailerExtra?: string } = {}): Buffer {
  const filter = opts.flate ? '/Filter/FlateDecode' : ''
  const parts = `%PDF-1.6\n1 0 obj <</Type/Catalog/Pages 2 0 R>> endobj\n2 0 obj <</Type/Pages/Kids [3 0 R]/Count 1>> endobj\n3 0 obj <</Type/Page/Parent 2 0 R/Contents 4 0 R>> endobj\n4 0 obj <<${filter}/Length ${contentStream.length}>>\nstream\n`
  const tail = `\nendstream\nendobj\n${opts.extraObjects || ''}trailer\n<</Size 9/Root 1 0 R${opts.trailerExtra || ''}>>\n%%EOF\n`
  return Buffer.concat([Buffer.from(parts, 'latin1'), contentStream, Buffer.from(tail, 'latin1')])
}

// Build a valid AES-256/R5 empty-user-password PDF given an explicit file key and IV.
function buildAes256Pdf(fileKey: Buffer, iv: Buffer): Buffer {
  const valSalt = Buffer.from('1122334455667788', 'hex')
  const keySalt = Buffer.from('99aabbccddeeff00', 'hex')
  const U = Buffer.concat([sha256(valSalt), valSalt, keySalt]) // sha256('' + valSalt) validates the empty pw
  const ue = crypto.createCipheriv('aes-256-cbc', sha256(keySalt), Buffer.alloc(16)); ue.setAutoPadding(false)
  const UE = Buffer.concat([ue.update(fileKey), ue.final()]) // 32-byte key, wrapped WITHOUT padding
  const enc = crypto.createCipheriv('aes-256-cbc', fileKey, iv) // stream: PKCS#7 autopadding, as producers do
  const cipher = Buffer.concat([iv, enc.update(zlib.deflateSync(Buffer.from(`BT (${PROSE}) Tj ET`, 'latin1'))), enc.final()])
  const hx = (b: Buffer) => `<${b.toString('hex')}>`
  const extra = `9 0 obj <</Filter/Standard/V 5/R 5/Length 256/P -540/U ${hx(U)}/UE ${hx(UE)}/O ${hx(crypto.randomBytes(48))}/OE ${hx(crypto.randomBytes(32))}/StrF/StdCF/StmF/StdCF/CF<</StdCF<</CFM/AESV3/Length 32>>>>>> endobj\n`
  return { pdf: buildPdf(cipher, { flate: true, extraObjects: extra, trailerExtra: '/Encrypt 9 0 R/ID [<b9deb8cf> <b9deb8cf>]' }), cipher } as any
}

await check('AES-256 (R5) file key whose LAST byte is in 1..16 still unwraps (no PKCS#7 on the /UE key)', () => {
  // A key ending in 0x08 — the exact captured-failure shape. Old code stripped 8 bytes → key short → ''.
  const fileKey = Buffer.concat([crypto.randomBytes(31), Buffer.from([0x08])])
  const { pdf } = buildAes256Pdf(fileKey, Buffer.alloc(16, 0x22))
  const t = extractPdfText(pdf)
  assert.ok(t.includes('Completion did not occur on 1 July 2026'), `decrypted text present, got: ${t}`)
})

await check('AES-256 (R5) file key ending in each of 0x01..0x10 all unwrap (the whole 6.25% band)', () => {
  for (let last = 1; last <= 16; last++) {
    const fileKey = Buffer.concat([Buffer.alloc(31, 0x30 + last), Buffer.from([last])])
    const { pdf } = buildAes256Pdf(fileKey, Buffer.alloc(16, last))
    const t = extractPdfText(pdf)
    assert.ok(t.includes('Completion did not occur on 1 July 2026'), `last=0x${last.toString(16)} extracts, got: ${t}`)
  }
})

await check('AES-256 (R5) stream whose ciphertext ends in 0x0a still decrypts (/Length honoured, not greedy)', () => {
  // Deterministically pick a file key so the AES-CBC ciphertext's LAST byte is the poison byte 0x0a.
  const iv = Buffer.alloc(16, 0x11)
  let fileKey = Buffer.alloc(0), cipher = Buffer.alloc(0)
  for (let c = 0; c < 100000; c++) {
    fileKey = sha256(Buffer.from(String(c)))
    const r = buildAes256Pdf(fileKey, iv)
    cipher = r.cipher
    if (cipher[cipher.length - 1] === 0x0a) break
  }
  assert.equal(cipher[cipher.length - 1], 0x0a, 'fixture precondition: ciphertext must end in 0x0a')
  const { pdf } = buildAes256Pdf(fileKey, iv)
  const t = extractPdfText(pdf)
  assert.ok(t.includes('Completion did not occur on 1 July 2026'), `decrypted text present, got: ${t}`)
})

await check('FlateDecode stream whose deflate bytes end in 0x0a still inflates (not truncated by the strip)', () => {
  // Vary trailing padding until the raw deflate output's last byte is 0x0a (the zlib Adler32 tail is ~random).
  let content = Buffer.alloc(0)
  for (let pad = 0; pad < 100000; pad++) {
    const def = zlib.deflateSync(Buffer.from(`BT (${PROSE}${' '.repeat(pad)}) Tj ET`, 'latin1'))
    if (def[def.length - 1] === 0x0a) { content = def; break }
  }
  assert.equal(content[content.length - 1], 0x0a, 'fixture precondition: deflate output must end in 0x0a')
  const t = extractPdfText(buildPdf(content, { flate: true }))
  assert.ok(t.includes('Completion did not occur on 1 July 2026'), `inflated text present, got: ${t}`)
})

console.log(`\npdf-encrypted-robustness: ${passed} checks passed`)
