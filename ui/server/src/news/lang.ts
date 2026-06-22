// English-only display, made safe. A slice of the wire arrives in another language (a Finnish Cision
// regulatory wire, a Japanese exchange filing, a German press release). The reader can only read English,
// so the cheap triage and the article-body read each return an OPTIONAL English translation of the
// headline. This module is the one guard that decides whether to TRUST that translation — so an English
// headline is never silently paraphrased (which would lose the verbatim text the event_id is hashed from)
// and a vendor never sees a re-written headline under the original's identity.
//
// The rule is deliberately conservative: keep the translation only when the model NAMED a non-English
// source language AND the translated text actually differs from the original. We trust the model's own
// language identification (it is far better at it than a regex) rather than guessing the language here.
// Pure, dependency-free, never throws. The original `headline` is ALWAYS preserved untouched; this only
// ever produces an ADDITIVE `headline_en` for the display layer to prefer.

/** Normalize for an "is this just the original echoed back?" comparison: lowercase, letters/digits only. */
function normForCompare(s: string): string {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
}

/** Is the model-reported source language English (or effectively unset)? Then there is nothing to translate
 *  and any returned `headline_en` must be dropped — it would be an English-to-English paraphrase. */
export function isEnglishLang(lang?: string | null): boolean {
  const l = String(lang || '').trim().toLowerCase()
  if (!l) return true // no language named → treat as English (don't risk paraphrasing)
  return /^(en|eng|english|en-[a-z]{2}|american|british)$/i.test(l)
}

export interface Translation {
  headline_en?: string
  headline_lang?: string // the source language the model named, e.g. "Finnish" — for the honest UI label
}

/**
 * Decide whether to keep a model-supplied translation of a headline. Returns the cleaned, capped
 * `headline_en` + `headline_lang` when the translation is trustworthy, or `{}` to keep the original only.
 *
 * Kept only when ALL hold:
 *   - the model returned a non-empty translation,
 *   - the model named a NON-English source language (its own language id — we don't second-guess it),
 *   - the translation is materially different from the original (not the original echoed back).
 */
export function keepTranslation(original: string, headline_en?: string | null, headline_lang?: string | null): Translation {
  const cand = String(headline_en || '').replace(/\s+/g, ' ').trim().slice(0, 500)
  const lang = String(headline_lang || '').replace(/\s+/g, ' ').trim().slice(0, 32)
  if (!cand) return {}
  if (isEnglishLang(lang)) return {} // model says it's English → there's nothing to translate
  if (normForCompare(cand) === normForCompare(original)) return {} // echoed the original back → not a translation
  return { headline_en: cand, headline_lang: lang || undefined }
}

/** The text to SHOW for a headline: the trusted English translation when we have one, else the original.
 *  Mirror of the web-side helper so server-built strings (the story floor, related-event rows) read English. */
export function displayHeadline(it: { headline?: string | null; headline_en?: string | null }): string {
  const en = String(it.headline_en || '').trim()
  return en || String(it.headline || '')
}
