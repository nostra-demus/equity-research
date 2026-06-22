// Bulletproof text hygiene for anything that reaches a human: scraped RSS/Atom titles and the cheap
// brain's guessed company names routinely carry raw HTML (a whole "<a href=…>…</a>" lands in a title),
// CDATA wrappers, and HTML entities. We strip the MARKUP and decode the ENTITIES while keeping every
// character of the real text — clean the garbage, never drop the signal. Pure, dependency-free, and
// applied at BOTH ingest (so the firehose stores clean) and on read (so the backlog renders clean).

/** Strip HTML tags + CDATA + decode entities + collapse whitespace. Never throws; '' in → '' out. */
export function cleanText(raw: unknown): string {
  let s = String(raw ?? '')
  if (!s) return ''
  // unwrap CDATA sections (keep the inner text)
  s = s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  // drop HTML/XML tags entirely but KEEP their inner text ("<a href=x>Title</a>" → " Title ")
  s = s.replace(/<\/?[a-zA-Z][^>]*>/g, ' ')
  // a stray unmatched "<" or ">" left behind (rare, malformed) — strip the angle brackets, keep text
  s = s.replace(/[<>]/g, ' ')
  // decode entities — numeric (hex + decimal) first, then the common named ones, &amp; LAST so an
  // already-encoded "&amp;#39;" doesn't double-decode
  s = s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => { try { return String.fromCodePoint(parseInt(h, 16)) } catch { return '' } })
    .replace(/&#(\d+);/g, (_, d) => { try { return String.fromCodePoint(Number(d)) } catch { return '' } })
    .replace(/&rsquo;|&lsquo;|&apos;/g, "'")
    .replace(/&rdquo;|&ldquo;|&quot;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
  return s.replace(/\s+/g, ' ').trim()
}

/** True if the cleaned text still looks like usable prose (a real headline), not empty markup debris.
 *  Accepts ANY letter or digit, not just ASCII — a pure Korean/Japanese/Chinese/Cyrillic headline (no
 *  Latin char) is real prose and must reach triage, where it gets translated to English. Gating on
 *  /[a-zA-Z0-9]/ silently dropped those foreign-script headlines before they could be read. */
export function looksLikeHeadline(cleaned: string): boolean {
  return cleaned.length >= 8 && /[\p{L}\p{N}]/u.test(cleaned)
}
