// Language detection + translation selection for the news wire. The screener pulls headlines from
// global wires — Korean, Japanese, Chinese, Cyrillic, Arabic, and the rest — and a Latin-reading
// desk must never face an untranslated headline it can't even sound out. The cheap triage brain
// returns an English translation (`headline_en`) alongside its score; this module is the deterministic,
// zero-cost layer that decides WHICH headlines need one and VALIDATES the model's translation before we
// trust it. Pure, dependency-free (built-ins only), so the whole policy is unit-testable with no I/O.
//
// Policy (set with the user, 2026-06-21): translate the genuinely-unreadable NON-LATIN scripts only.
// Latin-script European languages (French / German / Spanish …) are left as-is — they're broadly
// readable, and "is this English?" detection for Latin text is unreliable enough that forcing a
// translation would mostly reword already-English headlines (noise + token cost). Widening to "anything
// not English" is a one-line prompt change here plus dropping the non-Latin gate in pickTranslation().

// Unicode blocks for the scripts a Latin-reading desk can't read at a glance. Kept explicit (not
// \p{Script} regexes) so it runs on every Node target the engine ships on, with no /u-flag surprises:
//   CJK punctuation + Hiragana + Katakana + CJK Ext-A + CJK Unified + compat ideographs   (JA / ZH)
//   Hangul Jamo + compat Jamo + Hangul syllables + Jamo Ext-A/B                            (KO)
//   Cyrillic (+ supplement) · Arabic (+ supplement) · Hebrew · Thai                        (RU / AR / HE / TH)
//   Devanagari · Bengali · Gurmukhi · Greek                                                (HI / BN / PA / EL)
const NON_LATIN =
  /[　-〿぀-ヿㇰ-ㇿ㐀-䶿一-鿿豈-﫿가-힯ᄀ-ᇿ㄰-㆏ꥠ-꥿ힰ-퟿Ѐ-ԯ؀-ۿݐ-ݿ֐-׿฀-๿ऀ-ॿঀ-৿਀-੿Ͱ-Ͽἀ-῿]/

/** True when the text carries a non-Latin script (CJK / Hangul / Kana / Cyrillic / Arabic / Hebrew /
 *  Thai / Devanagari-Indic / Greek) — the clear "a Latin-reading desk can't read this" case. */
export function hasNonLatinScript(text: unknown): boolean {
  return NON_LATIN.test(String(text ?? ''))
}

const normCmp = (s: string): string => s.toLowerCase().replace(/\s+/g, ' ').trim()

/**
 * Decide the English headline to STORE for an item, given the original and the model's translation
 * candidate. Returns a trimmed translation ONLY when it is a genuine, usable English rendering of a
 * non-English (non-Latin-script) original; otherwise null, and the UI shows the original — never worse
 * than today. The guards, in order:
 *   1. original is already Latin-script → null (we don't translate readable headlines; see policy above)
 *   2. no candidate / empty candidate → null
 *   3. candidate STILL carries a non-Latin script → null (the model didn't actually render it in English)
 *   4. candidate equals the original (a plain echo, not a translation) → null
 */
export function pickTranslation(original: unknown, candidate: unknown): string | null {
  const orig = String(original ?? '')
  if (!hasNonLatinScript(orig)) return null // only translate the unreadable scripts
  const cand = String(candidate ?? '').replace(/\s+/g, ' ').trim().slice(0, 200)
  if (!cand) return null
  if (hasNonLatinScript(cand)) return null // model echoed / half-translated — not English
  if (normCmp(cand) === normCmp(orig)) return null // echo, not a translation
  return cand
}

/** The headline to use for any English-keyword scan (scope/sector/commodity classification): the stored
 *  English translation when we have one, else the original. Lets a Korean commodity story get bucketed
 *  by the same English lexicons as an English one, with no extra model cost. */
export function headlineForScan(it: { headline_en?: string | null; headline?: string | null }): string {
  return (it.headline_en && it.headline_en.trim()) || it.headline || ''
}
