// Language detection + translation selection for the news wire. The screener pulls headlines from
// global wires — Korean, Japanese, Chinese, Cyrillic, Arabic, and the rest — and a Latin-reading
// desk must never face an untranslated headline it can't even sound out. The cheap triage brain
// returns an English translation (`headline_en`) alongside its score; this module is the deterministic,
// zero-cost layer that decides WHICH headlines need one and VALIDATES the model's translation before we
// trust it. Pure, dependency-free (built-ins only), so the whole policy is unit-testable with no I/O.
//
// Policy (widened with the user, 2026-06-22): translate ANY non-English headline to English, including
// Latin-script European languages (Finnish / German / Spanish / French …) — the reported case was a
// Finnish Cision wire the desk couldn't read. The old worry with Latin text was that "is this English?"
// detection is unreliable, so a forced translation would just reword already-English headlines. We avoid
// that by NOT guessing: a Latin-script original is translated ONLY when the model itself NAMED a
// non-English source language (headline_lang), which is the reliable signal that the headline is genuinely
// foreign. A non-Latin script is always translated (it's unreadable to a Latin desk regardless).

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

/** Does the model-named source language read as English (or is it unset)? Then there is nothing to
 *  translate — a candidate for such an item would be an English-to-English reword, so we drop it. */
export function isEnglishLang(lang?: unknown): boolean {
  const l = String(lang ?? '').trim().toLowerCase()
  if (!l) return true // no language named → assume English (don't translate on a blank)
  return /^(en|eng|english|en[-_][a-z]{2,3}|american|british)$/i.test(l)
}

/**
 * Decide the English headline to STORE for an item, given the original, the model's translation
 * candidate, and the model's named source language. Returns a trimmed translation ONLY when it is a
 * genuine, usable English rendering of a non-English original; otherwise null, and the UI shows the
 * original — never worse than today. The guards, in order:
 *   1. no candidate / empty candidate → null
 *   2. candidate STILL carries a non-Latin script → null (the model didn't actually render it in English)
 *   3. candidate equals the original (a plain echo, not a translation) → null
 *   4. KEEP it when the original is a non-Latin script (always unreadable to a Latin desk), OR the model
 *      NAMED a non-English source language (the reliable "this Latin-script headline is genuinely foreign"
 *      signal). A Latin-script original with no / an English language stays as-is (no reword of English).
 */
export function pickTranslation(original: unknown, candidate: unknown, lang?: unknown): string | null {
  const orig = String(original ?? '')
  const cand = String(candidate ?? '').replace(/\s+/g, ' ').trim().slice(0, 200)
  if (!cand) return null
  if (hasNonLatinScript(cand)) return null // model echoed / half-translated — not English
  if (normCmp(cand) === normCmp(orig)) return null // echo, not a translation
  if (hasNonLatinScript(orig)) return cand // unreadable script → always translate
  if (!isEnglishLang(lang)) return cand // model named a non-English language → a real foreign headline
  return null
}

/** The headline to use for any English-keyword scan (scope/sector/commodity classification): the stored
 *  English translation when we have one, else the original. Lets a Korean commodity story get bucketed
 *  by the same English lexicons as an English one, with no extra model cost. */
export function headlineForScan(it: { headline_en?: string | null; headline?: string | null }): string {
  return (it.headline_en && it.headline_en.trim()) || it.headline || ''
}
