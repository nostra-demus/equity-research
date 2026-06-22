// English-only display helpers. A slice of the wire arrives in another language; the server attaches a
// trusted English translation (`headline_en`) + the source language (`headline_lang`) to the item. The UI
// shows the English text and keeps the original reachable on hover — see ui/server/src/news/lang.ts for how
// a translation is decided (never an English paraphrase). The original `headline` is always preserved.

export interface Translatable {
  headline: string
  headline_en?: string | null
  headline_lang?: string | null
}

/** The headline to SHOW: the trusted English translation when present, else the original. */
export function displayHeadline(it: Translatable): string {
  const en = (it.headline_en || '').trim()
  return en || it.headline
}

/** Is this item showing a translation (so the UI should label it + keep the original on hover)? */
export function isTranslated(it: Translatable): boolean {
  return !!(it.headline_en && it.headline_en.trim() && it.headline_en.trim() !== it.headline.trim())
}

/** "Auto-translated from Finnish" / "Auto-translated to English" when the source language is unknown. */
export function translatedLabel(it: Translatable): string {
  const lang = (it.headline_lang || '').trim()
  return lang ? `Auto-translated from ${lang}` : 'Auto-translated to English'
}
