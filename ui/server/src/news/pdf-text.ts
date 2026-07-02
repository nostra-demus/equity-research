// Dependency-free PDF text extraction (node built-ins only: zlib + crypto), for the filing-document
// read (news/filing-doc.ts). Exchange disclosures — ASX/HKEX announcements, NSE/BSE attachments — are
// PDFs, and the actual disclosure text is the highest-signal body the reader can get (§4: the filing IS
// the source). This module turns those bytes into readable text so the on-demand event read can lead
// with the real announcement instead of the deterministic headline floor.
//
// Scope, deliberately bounded:
//   - FlateDecode (and raw) streams only — the compression every text PDF generator emits. Image-only /
//     LZW / exotic filters simply yield no text (→ the caller keeps the honest floor; never a throw).
//   - Standard-security ENCRYPTED PDFs with an EMPTY user password — the norm for exchange filings,
//     which are "encrypted" only to restrict editing, while every human can open them. RC4 (R2–R4),
//     AES-128 (R4/AESV2) and AES-256 (R5/R6) are all supported. A really password-protected file
//     (non-empty user password) fails validation and yields '' — we never crack anything.
//   - Text operators Tj / ' / " / TJ inside BT…ET, literal + hex strings, with ToUnicode CMaps merged
//     across fonts for hex/CID output. Layout is approximated (newline on Td/TD/T*/ET), which is exactly
//     what an LLM body-read needs — prose order, not typography.
// Never throws. Returns '' whenever the bytes don't carry extractable text (scanned image, unsupported
// scheme, garbage) — the caller treats '' as "no document text" and degrades honestly.

import crypto from 'node:crypto'
import zlib from 'node:zlib'

// ---- small primitives ----

/** RC4 — hand-rolled because OpenSSL 3 ships with RC4 disabled; 20 lines, symmetric. */
export function rc4(key: Buffer, data: Buffer): Buffer {
  const S = new Uint8Array(256)
  for (let i = 0; i < 256; i++) S[i] = i
  let j = 0
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + key[i % key.length]) & 0xff
    const t = S[i]; S[i] = S[j]; S[j] = t
  }
  const out = Buffer.alloc(data.length)
  let a = 0, b = 0
  for (let k = 0; k < data.length; k++) {
    a = (a + 1) & 0xff
    b = (b + S[a]) & 0xff
    const t = S[a]; S[a] = S[b]; S[b] = t
    out[k] = data[k] ^ S[(S[a] + S[b]) & 0xff]
  }
  return out
}

const md5 = (...parts: Buffer[]): Buffer => crypto.createHash('md5').update(Buffer.concat(parts)).digest()
const sha256 = (...parts: Buffer[]): Buffer => crypto.createHash('sha256').update(Buffer.concat(parts)).digest()

// stripPad=true for stream/string data (PKCS#7-padded per the spec); stripPad=false for the /UE file-key
// unwrap (ISO 32000-2 Alg. 2.A: a raw 32-byte AES-CBC block, NO padding). Stripping padding off the
// unwrap silently truncated the key whenever its last byte landed in 1..16 (16/256 ≈ 6.25% of files) —
// the key then read short and the whole encrypted PDF was wrongly rejected as "unsupported".
function aesCbcDecrypt(bits: 128 | 256, key: Buffer, iv: Buffer, data: Buffer, stripPad = true): Buffer | null {
  try {
    const d = crypto.createDecipheriv(bits === 128 ? 'aes-128-cbc' : 'aes-256-cbc', key, iv)
    d.setAutoPadding(false) // PDF pads with PKCS#7 but broken producers exist — strip manually below
    let out = Buffer.concat([d.update(data), d.final()])
    if (stripPad) {
      const pad = out[out.length - 1]
      if (pad >= 1 && pad <= 16 && pad <= out.length) out = out.subarray(0, out.length - pad)
    }
    return out
  } catch { return null }
}

function aesCbcEncryptNoPad(key: Buffer, iv: Buffer, data: Buffer): Buffer {
  const c = crypto.createCipheriv('aes-128-cbc', key, iv)
  c.setAutoPadding(false)
  return Buffer.concat([c.update(data), c.final()])
}

// PDF literal-string parser: returns the decoded bytes and the index just past the closing ')'.
function parseLiteralBytes(buf: Buffer, start: number): { bytes: Buffer; end: number } | null {
  if (buf[start] !== 0x28) return null
  const out: number[] = []
  let i = start + 1
  let depth = 1
  while (i < buf.length && depth > 0) {
    const c = buf[i]
    if (c === 0x5c) { // backslash escape
      const n = buf[i + 1]
      if (n >= 0x30 && n <= 0x37) { // \ddd octal, up to 3 digits
        let oct = 0, k = 0
        while (k < 3 && buf[i + 1 + k] >= 0x30 && buf[i + 1 + k] <= 0x37) { oct = oct * 8 + (buf[i + 1 + k] - 0x30); k++ }
        out.push(oct & 0xff); i += 1 + k; continue
      }
      if (n === 0x0a) { i += 2; continue } // line continuation
      if (n === 0x0d) { i += buf[i + 2] === 0x0a ? 3 : 2; continue }
      const map: Record<number, number> = { 0x6e: 10, 0x72: 13, 0x74: 9, 0x62: 8, 0x66: 12, 0x28: 0x28, 0x29: 0x29, 0x5c: 0x5c }
      out.push(map[n] ?? n); i += 2; continue
    }
    if (c === 0x28) depth++
    else if (c === 0x29) { depth--; if (!depth) { i++; break } }
    out.push(c); i++
  }
  return { bytes: Buffer.from(out), end: i }
}

const hexToBytes = (hex: string): Buffer => {
  const h = hex.replace(/[^0-9a-fA-F]/g, '')
  return Buffer.from(h.length % 2 ? h + '0' : h, 'hex')
}

// WinAnsi (CP1252) high bytes that matter in prose — smart quotes, dashes, ellipsis, bullets — so
// "Triton's" doesn't come out as "Tritons". Everything else ≥ 0x80 falls back to latin1.
const WINANSI: Record<number, string> = {
  0x82: '‚', 0x84: '„', 0x85: '…', 0x88: 'ˆ', 0x8b: '‹', 0x91: '‘', 0x92: '’', 0x93: '“', 0x94: '”',
  0x95: '•', 0x96: '–', 0x97: '—', 0x99: '™', 0x9b: '›', 0xa0: ' ',
}
function bytesToText(bytes: Buffer): string {
  // CID/Identity-H literal strings are 2-byte codes → every other byte is 0x00. Strip the nulls and
  // read the low bytes (the common Latin subset), rather than emitting NUL-riddled garbage.
  let src = bytes
  if (bytes.length >= 4) {
    let nulEven = 0
    for (let i = 0; i < bytes.length; i += 2) if (bytes[i] === 0) nulEven++
    if (nulEven >= Math.floor(bytes.length / 2) * 0.8) {
      const low: number[] = []
      for (let i = 1; i < bytes.length; i += 2) low.push(bytes[i])
      src = Buffer.from(low)
    }
  }
  let out = ''
  for (const b of src) out += WINANSI[b] ?? (b >= 0x20 || b === 0x09 ? String.fromCharCode(b) : b === 0 ? '' : ' ')
  return out
}

// ---- standard security handler (empty user password only) ----

// the spec's 32-byte password pad (Algorithm 2)
const PAD = Buffer.from('28bf4e5e4e758a4164004e56fffa01082e2e00b6d0683e802f0ca9fe6453697a', 'hex')

interface EncryptInfo {
  v: number
  r: number
  fileKey: Buffer
  cfm: 'rc4' | 'aes128' | 'aes256'
}

// pull a string value (literal or hex) for a dict key like /U /O /UE /OE out of the encrypt dict
function dictString(buf: Buffer, latin: string, dictStart: number, dictEnd: number, key: string): Buffer | null {
  let i = latin.indexOf(`/${key}`, dictStart)
  // avoid /U matching /UE etc.: the char after the key must not be alphanumeric
  while (i >= 0 && i < dictEnd) {
    const after = latin[i + key.length + 1]
    if (!/[A-Za-z0-9]/.test(after || '')) break
    i = latin.indexOf(`/${key}`, i + 1)
  }
  if (i < 0 || i >= dictEnd) return null
  let j = i + key.length + 1
  while (j < dictEnd && /\s/.test(latin[j])) j++
  if (latin[j] === '(') return parseLiteralBytes(buf, j)?.bytes ?? null
  if (latin[j] === '<' && latin[j + 1] !== '<') {
    const close = latin.indexOf('>', j)
    if (close < 0) return null
    return hexToBytes(latin.slice(j + 1, close))
  }
  return null
}

function dictNumber(latin: string, dictStart: number, dictEnd: number, key: string): number | null {
  const re = new RegExp(`/${key}\\s+(-?\\d+)`)
  const m = re.exec(latin.slice(dictStart, dictEnd))
  return m ? Number(m[1]) : null
}

/** ISO 32000-2 Algorithm 2.B — the R6 iterated hash. */
export function hash2B(pw: Buffer, salt: Buffer, udata: Buffer): Buffer {
  let K: Buffer = sha256(pw, salt, udata)
  let E: Buffer = Buffer.alloc(1)
  for (let i = 0; i < 64 || E[E.length - 1] > i - 32; i++) {
    const block = Buffer.concat([pw, K, udata])
    const K1 = Buffer.concat(new Array(64).fill(block))
    E = aesCbcEncryptNoPad(K.subarray(0, 16), K.subarray(16, 32), K1)
    const mod = E.subarray(0, 16).reduce((a, b) => a + b, 0) % 3
    K = crypto.createHash(mod === 0 ? 'sha256' : mod === 1 ? 'sha384' : 'sha512').update(E).digest()
    if (i > 4096) return K.subarray(0, 32) // spec guarantees termination; belt-and-braces bound
  }
  return K.subarray(0, 32)
}

/** Parse /Encrypt and derive the file key for an EMPTY user password. Null → unencrypted or unsupported. */
function parseEncryption(buf: Buffer, latin: string): EncryptInfo | 'unsupported' | null {
  // the LAST /Encrypt reference wins (incremental updates append)
  const encAt = latin.lastIndexOf('/Encrypt')
  if (encAt < 0) return null
  const refM = /^\/Encrypt\s+(\d+)\s+(\d+)\s+R/.exec(latin.slice(encAt, encAt + 40))
  if (!refM) return 'unsupported' // inline encrypt dict — vanishingly rare; treat as unsupported
  const objRe = new RegExp(`(?:^|[^0-9])${refM[1]}\\s+${refM[2]}\\s+obj\\b`, 'g')
  let objAt = -1
  for (let m = objRe.exec(latin); m; m = objRe.exec(latin)) objAt = m.index // last definition wins
  if (objAt < 0) return 'unsupported'
  const dictEnd = Math.min(latin.length, latin.indexOf('endobj', objAt) < 0 ? latin.length : latin.indexOf('endobj', objAt))

  const v = dictNumber(latin, objAt, dictEnd, 'V') ?? 0
  const r = dictNumber(latin, objAt, dictEnd, 'R') ?? (v <= 1 ? 2 : 3)
  const length = dictNumber(latin, objAt, dictEnd, 'Length') ?? 40
  const p = dictNumber(latin, objAt, dictEnd, 'P') ?? -1
  const U = dictString(buf, latin, objAt, dictEnd, 'U')
  const O = dictString(buf, latin, objAt, dictEnd, 'O')
  if (!U || !O) return 'unsupported'

  if (r === 5 || r === 6) {
    // AES-256: validate the empty USER password, then unwrap the file key from /UE
    const UE = dictString(buf, latin, objAt, dictEnd, 'UE')
    if (!UE || U.length < 48 || UE.length < 32) return 'unsupported'
    const valSalt = U.subarray(32, 40)
    const keySalt = U.subarray(40, 48)
    const empty = Buffer.alloc(0)
    const check = r === 5 ? sha256(empty, valSalt) : hash2B(empty, valSalt, empty)
    if (!check.equals(U.subarray(0, 32))) return 'unsupported' // a REAL user password — we don't crack
    const ikey = r === 5 ? sha256(empty, keySalt) : hash2B(empty, keySalt, empty)
    const fileKey = aesCbcDecrypt(256, ikey, Buffer.alloc(16), UE.subarray(0, 32), false) // no PKCS#7 here
    if (!fileKey || fileKey.length < 32) return 'unsupported'
    return { v, r, fileKey: fileKey.subarray(0, 32), cfm: 'aes256' }
  }

  if (r >= 2 && r <= 4) {
    // Algorithm 2 with the padded empty password
    const idAt = latin.lastIndexOf('/ID')
    let id0: Buffer = Buffer.alloc(0)
    if (idAt >= 0) {
      const seg = latin.slice(idAt, idAt + 200)
      const hexM = /\[\s*<([0-9a-fA-F]*)>/.exec(seg)
      if (hexM) id0 = hexToBytes(hexM[1])
      else {
        const litAt = seg.indexOf('[')
        const parenAt = seg.indexOf('(', litAt)
        if (parenAt > 0) id0 = parseLiteralBytes(buf, idAt + parenAt)?.bytes ?? Buffer.alloc(0)
      }
    }
    const n = r === 2 ? 5 : Math.max(5, Math.min(16, Math.floor(length / 8)))
    const pBuf = Buffer.alloc(4)
    pBuf.writeInt32LE(p, 0)
    // /EncryptMetadata false adds 0xFFFFFFFF for R≥4
    const encMeta = !/\/EncryptMetadata\s+false/.test(latin.slice(objAt, dictEnd))
    const extra = r >= 4 && !encMeta ? Buffer.from('ffffffff', 'hex') : Buffer.alloc(0)
    let key: Buffer = md5(PAD, O.subarray(0, 32), pBuf, id0, extra).subarray(0, n)
    if (r >= 3) for (let i = 0; i < 50; i++) key = md5(key.subarray(0, n)).subarray(0, n)
    // validate the empty USER password (Algorithm 4/5) — refuse to guess-decrypt a protected file
    if (r === 2) {
      if (!rc4(key, PAD).subarray(0, 16).equals(U.subarray(0, 16))) return 'unsupported'
    } else {
      let x = md5(PAD, id0)
      x = rc4(key, x)
      for (let i = 1; i <= 19; i++) {
        const k2 = Buffer.from(key)
        for (let j = 0; j < k2.length; j++) k2[j] ^= i
        x = rc4(k2, x)
      }
      if (!x.subarray(0, 16).equals(U.subarray(0, 16))) return 'unsupported'
    }
    // V4 crypt filters: AESV2 = AES-128; V2 (or anything else) = RC4
    const aes = v === 4 && /\/CFM\s*\/AESV2/.test(latin.slice(objAt, dictEnd))
    return { v, r, fileKey: key, cfm: aes ? 'aes128' : 'rc4' }
  }
  return 'unsupported'
}

const SALT_AES = Buffer.from('73416c54', 'hex') // 'sAlT' — the AESV2 per-object key suffix

function decryptStream(enc: EncryptInfo, objNum: number, gen: number, data: Buffer): Buffer | null {
  if (enc.cfm === 'aes256') {
    if (data.length < 17) return null
    return aesCbcDecrypt(256, enc.fileKey, data.subarray(0, 16), data.subarray(16))
  }
  const numBuf = Buffer.alloc(5)
  numBuf.writeUIntLE(objNum, 0, 3)
  numBuf.writeUIntLE(gen & 0xffff, 3, 2)
  const keyLen = Math.min(enc.fileKey.length + 5, 16)
  const objKey = md5(enc.fileKey, numBuf, ...(enc.cfm === 'aes128' ? [SALT_AES] : [])).subarray(0, keyLen)
  if (enc.cfm === 'aes128') {
    if (data.length < 17) return null
    return aesCbcDecrypt(128, objKey, data.subarray(0, 16), data.subarray(16))
  }
  return rc4(objKey, data)
}

// ---- ToUnicode CMaps (for hex/CID strings) ----

interface CMap { map: Map<number, string>; codeBytes: 1 | 2 }

// A real subset font maps at most a few thousand glyphs; 65,536 entries covers the entire 2-byte code
// space. The cap counts loop ITERATIONS (work), not map size, so a crafted CMap that spams thousands of
// identical wide bfranges (same keys overwritten — map never grows) still cannot stall the event loop.
const CMAP_MAX_WORK = 200_000

function parseCMap(txt: string): CMap | null {
  if (!/begincmap/.test(txt) || !/(beginbfchar|beginbfrange)/.test(txt)) return null
  const src = txt.slice(0, 500_000) // a legitimate ToUnicode is a few KB; never scan megabytes
  const map = new Map<number, string>()
  let codeBytes: 1 | 2 = 2
  const csM = /begincodespacerange\s*<([0-9a-fA-F]+)>/.exec(src)
  if (csM) codeBytes = csM[1].length <= 2 ? 1 : 2
  const dstToStr = (hex: string): string => {
    const b = hexToBytes(hex)
    let s = ''
    for (let i = 0; i + 1 < b.length; i += 2) s += String.fromCharCode((b[i] << 8) | b[i + 1])
    if (b.length === 1) s = String.fromCharCode(b[0])
    return s
  }
  let work = 0
  for (const seg of src.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const m of seg[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g)) {
      if (++work > CMAP_MAX_WORK) return map.size ? { map, codeBytes } : null
      map.set(parseInt(m[1], 16), dstToStr(m[2]))
    }
  }
  for (const seg of src.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    // <lo> <hi> <dst>  |  <lo> <hi> [<d1> <d2> …]
    const body = seg[1]
    const re = /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*(<[0-9a-fA-F]+>|\[[^\]]*\])/g
    for (const m of body.matchAll(re)) {
      const lo = parseInt(m[1], 16), hi = parseInt(m[2], 16)
      if (hi - lo > 0xffff) continue
      if (work > CMAP_MAX_WORK) return map.size ? { map, codeBytes } : null
      if (m[3].startsWith('[')) {
        const dsts = [...m[3].matchAll(/<([0-9a-fA-F]+)>/g)].map((d) => dstToStr(d[1]))
        for (let c = lo; c <= hi && c - lo < dsts.length && work <= CMAP_MAX_WORK; c++, work++) map.set(c, dsts[c - lo])
      } else {
        const base = dstToStr(m[3].slice(1, -1))
        const baseCode = base.charCodeAt(base.length - 1)
        for (let c = lo; c <= hi && work <= CMAP_MAX_WORK; c++, work++) map.set(c, base.slice(0, -1) + String.fromCharCode(baseCode + (c - lo)))
      }
    }
  }
  return map.size ? { map, codeBytes } : null
}

/** Share of bytes that read as printable text (plus whitespace). The gate that keeps binary noise —
 *  a mis-decoded stream, an unmapped glyph run — out of the extracted prose. */
function printableRatio(s: string | Buffer): number {
  const n = Math.min(s.length, 20_000)
  if (!n) return 0
  let ok = 0
  for (let i = 0; i < n; i++) {
    const c = typeof s === 'string' ? s.charCodeAt(i) : s[i]
    if ((c >= 0x20 && c <= 0x7e) || c === 0x0a || c === 0x0d || c === 0x09) ok++
  }
  return ok / n
}

// share of characters that look like prose (letters, digits, space, sentence punctuation) — the
// arbiter between two candidate decodes: the true font's output reads like language, a wrong subset
// font's output reads like glyph salad.
function textiness(s: string): number {
  if (!s.length) return 0
  let ok = 0
  for (const ch of s) if (/[A-Za-z0-9 .,;:'"()\-–—%$€£₹&/]/.test(ch)) ok++
  return ok / s.length
}

function hexStringToText(bytes: Buffer, cmaps: CMap[]): string {
  if (!bytes.length) return ''
  // Without per-font (Tf) tracking we cannot know WHICH font's ToUnicode applies, so decode against
  // every map that plausibly fits and ARBITRATE. Two subset fonts routinely share the same low glyph-id
  // range with DIFFERENT letters behind it — blindly taking the first fitting map would emit
  // plausible-but-wrong words as the filing's own text, the one failure §3 forbids outright. So: take
  // the decode only when the candidates agree, or one fits DECISIVELY better (coverage margin), or one
  // alone reads like language while the other is glyph salad. A dead tie is genuinely ambiguous → drop
  // the string: a missing fragment degrades to the honest floor; a wrong one is a fabrication.
  const fits: { out: string; ratio: number }[] = []
  for (const cm of cmaps) {
    let out = ''
    let hit = 0, total = 0
    if (cm.codeBytes === 2) {
      for (let i = 0; i + 1 < bytes.length; i += 2) {
        const code = (bytes[i] << 8) | bytes[i + 1]
        const t = cm.map.get(code)
        total++
        if (t !== undefined) { out += t; hit++ } else out += ' '
      }
    } else {
      for (const b of bytes) {
        const t = cm.map.get(b)
        total++
        if (t !== undefined) { out += t; hit++ } else out += ' '
      }
    }
    if (total && hit / total >= 0.6) fits.push({ out, ratio: hit / total })
  }
  if (fits.length) {
    if (fits.every((f) => f.out === fits[0].out)) return fits[0].out // unanimous
    fits.sort((a, b) => b.ratio - a.ratio)
    const [best, second] = fits
    if (best.ratio - second.ratio >= 0.25) return best.out // decisively better coverage
    const tBest = textiness(best.out), tSecond = textiness(second.out)
    if (tBest - tSecond >= 0.2) return best.out
    if (tSecond - tBest >= 0.2) return second.out
    return '' // a dead tie between disagreeing fonts — ambiguous, never guess
  }
  // no fitting CMap: read the bytes only when they actually LOOK like text — glyph-id runs that decode
  // to binary noise are dropped rather than smeared into the prose
  return printableRatio(bytes) >= 0.7 ? bytesToText(bytes) : ''
}

// ---- content-stream text assembly ----

/** Pull readable text from ONE decoded content stream (the BT/ET text operators). Exported for tests. */
export function textFromContentStream(txt: string, cmaps: CMap[] = []): string {
  let out = ''
  const buf = Buffer.from(txt, 'latin1')
  let i = 0
  const n = txt.length
  while (i < n) {
    const c = txt[i]
    if (c === '(') {
      const lit = parseLiteralBytes(buf, i)
      if (!lit) { i++; continue }
      out += bytesToText(lit.bytes)
      i = lit.end
      continue
    }
    if (c === '<' && txt[i + 1] !== '<') {
      const close = txt.indexOf('>', i)
      if (close < 0) { i++; continue }
      out += hexStringToText(hexToBytes(txt.slice(i + 1, close)), cmaps)
      i = close + 1
      continue
    }
    // a large negative kerning inside a TJ array is a word gap
    if (c === '-' || (c >= '0' && c <= '9')) {
      const m = /^-?\d+(?:\.\d+)?/.exec(txt.slice(i, i + 24))
      if (m) {
        if (Number(m[0]) <= -180) out += ' '
        i += m[0].length
        continue
      }
    }
    if (txt.startsWith('Td', i) || txt.startsWith('TD', i) || txt.startsWith('T*', i) || txt.startsWith('ET', i)) {
      out += '\n'
      i += 2
      continue
    }
    if (c === "'" || c === '"') { out += '\n'; i++; continue }
    if (txt.startsWith('BI', i)) { // inline image — skip to EI so binary bytes can't masquerade as text
      const ei = txt.indexOf('EI', i + 2)
      i = ei < 0 ? n : ei + 2
      continue
    }
    i++
  }
  return out
}

// ---- the extractor ----

export interface PdfTextOptions {
  maxBytes?: number // refuse inputs larger than this (default 12 MB)
  maxChars?: number // cap the extracted text (default 6000 — analyzeArticle's own body cap)
}

/** True when the bytes look like a PDF at all. */
export const looksLikePdf = (buf: Buffer): boolean => buf.length > 100 && buf.subarray(0, 1024).includes('%PDF-')

/**
 * Extract readable text from a PDF. Never throws; returns '' when the bytes carry no extractable text
 * (image-only scan, unsupported encryption, a real password, or not a PDF at all).
 */
export function extractPdfText(input: Buffer, opts: PdfTextOptions = {}): string {
  try {
    const maxBytes = opts.maxBytes ?? 12_000_000
    const maxChars = opts.maxChars ?? 6000
    if (!input || input.length > maxBytes || !looksLikePdf(input)) return ''
    const latin = input.toString('latin1')

    const enc = parseEncryption(input, latin)
    if (enc === 'unsupported') return '' // encrypted in a way we can't (or shouldn't) read

    // walk every "N G obj … stream … endstream" in document order — generation order is prose order
    // for every real-world report generator, which is all the LLM read needs.
    const texts: string[] = []
    const cmaps: CMap[] = []
    const pending: { txt: string }[] = []
    let pendingChars = 0 // bound the DECODED accumulation — a crafted PDF must not balloon memory
    const objRe = /(\d+)\s+(\d+)\s+obj\b/g
    for (let m = objRe.exec(latin); m; m = objRe.exec(latin)) {
      if (pendingChars > 2_000_000) break // far beyond any maxChars we will emit
      const objNum = Number(m[1])
      const gen = Number(m[2])
      const objEnd = latin.indexOf('endobj', m.index)
      const streamAt = latin.indexOf('stream', m.index)
      if (streamAt < 0 || (objEnd >= 0 && streamAt > objEnd)) continue
      const dict = latin.slice(m.index, streamAt)
      let ds = streamAt + 6
      if (input[ds] === 0x0d) ds++
      if (input[ds] === 0x0a) ds++
      const es = latin.indexOf('endstream', ds)
      if (es < 0) continue
      // The stream's exact byte length is /Length (PDF 32000-1 §7.3.8.1) — the delimiter EOL before
      // `endstream` is NOT part of the data. Trust a plain (direct) /Length that lands at-or-before the
      // `endstream` we found: this recovers the exact bytes even when the data itself ends in 0x0a/0x0d.
      // Only when /Length is absent or indirect (`/Length N 0 R`) do we fall back to the endstream scan,
      // and there strip just the SINGLE trailing EOL marker — never a greedy run of 0x0a/0x0d, which
      // would eat a genuine final data byte and break AES-CBC alignment (→ decrypt null) or truncate the
      // inflate buffer (→ no text). The greedy strip silently dropped ~1/256 of binary streams.
      const declaredLen = dictNumber(latin, m.index, streamAt, 'Length')
      let raw: Buffer
      if (declaredLen != null && declaredLen >= 0 && ds + declaredLen <= es) {
        raw = input.subarray(ds, ds + declaredLen)
      } else {
        raw = input.subarray(ds, es)
        let end = raw.length
        if (end >= 2 && raw[end - 2] === 0x0d && raw[end - 1] === 0x0a) end -= 2        // CRLF delimiter
        else if (end >= 1 && (raw[end - 1] === 0x0a || raw[end - 1] === 0x0d)) end -= 1 // lone LF or CR
        raw = raw.subarray(0, end)
      }
      objRe.lastIndex = es + 9
      if (!raw.length || raw.length > maxBytes) continue

      // xref streams / object streams / XMP metadata carry structure, not prose.
      if (/\/Type\s*\/(XRef|ObjStm|Metadata)\b/.test(dict)) continue
      const hasFlate = /\/(?:Filter\s*(?:\/FlateDecode\b|\[\s*\/FlateDecode\b))/.test(dict)
      const hasOtherFilter = /\/Filter/.test(dict) && !hasFlate

      const tryDecode = (bytes: Buffer): string | null => {
        if (hasOtherFilter) return null // LZW/DCT/… — not text we can read
        if (hasFlate) {
          try { return zlib.inflateSync(bytes, { maxOutputLength: 4_000_000 }).toString('latin1') } catch { return null }
        }
        return bytes.toString('latin1')
      }

      let decoded: string | null = null
      if (enc) {
        const plain = decryptStream(enc, objNum, gen, raw)
        if (plain) decoded = tryDecode(plain)
        if (decoded === null) decoded = tryDecode(raw) // some producers leave odd streams unencrypted
      } else {
        decoded = tryDecode(raw)
      }
      if (decoded === null) continue

      const cm = parseCMap(decoded)
      if (cm) { cmaps.push(cm); continue }
      // A content stream = printable operator text carrying text-showing operators. NO requirement that
      // BT appears in the SAME stream: a page's /Contents is routinely split across several stream
      // objects mid-text-object (the ASX/Word generator does exactly this), so a continuation stream
      // has TJ/Tj but no BT. The printable-ratio gate is what keeps mis-decoded binary noise out.
      if (printableRatio(decoded) >= 0.82 && /(\bTj\b|\bTJ\b)/.test(decoded)) { pending.push({ txt: decoded }); pendingChars += decoded.length }
    }

    // decode content AFTER the full pass so CMaps defined later in the file still apply
    for (const p of pending) texts.push(textFromContentStream(p.txt, cmaps))

    const joined = texts.join('\n')
    const lines = joined
      .split('\n')
      .map((l) => l.replace(/\s+/g, ' ').trim())
      .filter((l) => l.length > 1)
      // symbol-soup gate: a subset font with remapped glyphs and no usable ToUnicode decodes to printable
      // punctuation noise ('!"#$%&…'). A prose line has more letters than heavy symbols; a numeric table
      // row has digits, not symbol runs. Lines that fail are glyph noise — drop them, keep the rest.
      .filter((l) => {
        const letters = (l.match(/[A-Za-zÀ-ɏ]/g) || []).length
        const symbols = (l.match(/[!"#$%&*<>@^_`{}|~\\]/g) || []).length
        return symbols <= letters || (letters === 0 && symbols <= 1)
      })
    const text = lines.join('\n')
    // an image-only scan yields decoration, not prose — demand real letters before claiming text
    const letters = (text.match(/[A-Za-z]/g) || []).length
    if (letters < 60) return ''
    return text.slice(0, maxChars)
  } catch {
    return ''
  }
}
