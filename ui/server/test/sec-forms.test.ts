// SEC EDGAR form legibility (news/sec-forms.ts): turn a raw EDGAR feed title ("424B2 - GOLDMAN SACHS
// GROUP INC (CIK) (Filer)") into a parsed { form, filer, cik, role }, a plain-English story, and the
// form-code token set the themes tokenizer must ignore. Pure, no network, no LLM.
// Run: npx tsx test/sec-forms.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { SEC_FORM_TOKENS, lookupSecForm, parseEdgarFilingHeadline, secFilingStory, tidyFilerName } from '../src/news/sec-forms'

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}

check('parses a 424B2 EDGAR title into form / filer / cik / role', () => {
  const p = parseEdgarFilingHeadline('424B2 - GOLDMAN SACHS GROUP INC (0000886982) (Filer)')
  assert.ok(p, 'parsed')
  assert.equal(p!.form, '424B2')
  assert.equal(p!.filer, 'GOLDMAN SACHS GROUP INC')
  assert.equal(p!.cik, '0000886982')
  assert.equal(p!.role, 'Filer')
})

check('parses a multi-word form code ("SC 13D") and a non-CIK role', () => {
  const p = parseEdgarFilingHeadline('SC 13D - Acme Holdings Inc (0001234567) (Subject)')
  assert.equal(p!.form, 'SC 13D')
  assert.equal(p!.filer, 'Acme Holdings Inc')
  assert.equal(p!.role, 'Subject')
})

check('a normal hyphenated headline is NOT mistaken for a filing', () => {
  // left side isn't a known form code → undefined (so we never mangle real news)
  assert.equal(parseEdgarFilingHeadline('Apple - Q2 results beat expectations'), undefined)
  assert.equal(parseEdgarFilingHeadline('Reliance Industries - board meeting outcome'), undefined)
  assert.equal(parseEdgarFilingHeadline('No separator here at all'), undefined)
})

check('the 424B2 story explains the form in plain English + flags it as routine', () => {
  const s = secFilingStory('424B2 - GOLDMAN SACHS GROUP INC (0000886982) (Filer)')
  assert.ok(s, 'a story')
  assert.ok(/Goldman Sachs Group Inc/.test(s!), `tidied filer name: ${s}`)
  assert.ok(/424B2/.test(s!), 'names the form')
  assert.ok(/prospectus|shelf/i.test(s!), 'explains what the form is')
  assert.ok(/structured-note|rarely move/i.test(s!), 'flags the routine nature')
  assert.ok(!/\(Filer\)|\d{6,}/.test(s!), `drops the CIK + role tag noise: ${s}`)
})

check('an 8-K story reads as a material-event report (not routine)', () => {
  const s = secFilingStory('8-K - JPMORGAN CHASE & CO (0000019617) (Filer)')
  assert.ok(/Form 8-K/.test(s!), 'references the form conventionally (avoids "a 8-K")')
  assert.ok(!/rarely move/i.test(s!), 'an 8-K is not flagged routine')
})

check('an unknown form yields no fabricated story', () => {
  assert.equal(secFilingStory('ZZ-99 - Some Co (0000000001) (Filer)'), undefined)
  assert.equal(lookupSecForm('ZZ-99'), undefined)
})

check('amendment suffix "/A" is described as an amended filing', () => {
  const info = lookupSecForm('10-K/A')
  assert.ok(info, 'known')
  assert.ok(/amend/i.test(info!.label + info!.meaning), 'reads as an amendment')
})

check('SEC_FORM_TOKENS holds the digit+letter codes that leak, but NOT word-shaped forms', () => {
  assert.ok(SEC_FORM_TOKENS.has('424b2'), 'the high-volume prospectus code is excluded')
  assert.ok(SEC_FORM_TOKENS.has('defa14a'), 'the proxy-soliciting code is excluded')
  // "EFFECT" is also the English word "effect" — must NOT be swept out of the topic vocabulary
  assert.ok(!SEC_FORM_TOKENS.has('effect'), 'a word-shaped form is kept as a real topic anchor')
  // every token carries a digit (a form code), never a bare word
  for (const t of SEC_FORM_TOKENS) assert.ok(/\d/.test(t) && /[a-z]/.test(t), `token is a form code: ${t}`)
})

check('EFFECT (a word-shaped form) is parsed + explained — not dropped by a shape filter', () => {
  // EFFECT is a real form (the live "Latest EFFECT" feed emits it) but 6 letters, so the old FORM_SHAPE
  // regex (tuned for digit codes, max 5) rejected it before the dictionary check could see it.
  const p = parseEdgarFilingHeadline('EFFECT - SOME ISSUER CORP (0001234567) (Filer)')
  assert.ok(p, 'parsed (the old FORM_SHAPE regex rejected it)')
  assert.equal(p!.form, 'EFFECT')
  const s = secFilingStory('EFFECT - SOME ISSUER CORP (0001234567) (Filer)')
  assert.ok(s && /registration|effective/i.test(s), `explains EFFECT: ${s}`)
})

check('a Subject-role ownership title does NOT claim the named (target) company "filed"', () => {
  // EDGAR names the SUBJECT (target) on SC 13D / SC TO-T / SC 14D9 titles ending "(Subject)". The filer
  // is the acquirer/bidder, so "Target Company Inc filed Form SC 13D" would be a false attribution (§3).
  const s = secFilingStory('SC 13D - TARGET COMPANY INC (0001234567) (Subject)')
  assert.ok(s, 'a story')
  assert.ok(!/Target Company Inc filed/i.test(s!), `no false "filed" attribution: ${s}`)
  assert.ok(/subject company/i.test(s!), `names it as the subject instead: ${s}`)
})

check('a Filer-role ownership title DOES read as that company filing', () => {
  const s = secFilingStory('SC 13D - ACQUIRER PARTNERS LP (0001234567) (Filer)')
  assert.ok(/Acquirer Partners Lp filed Form SC 13D/i.test(s!), `filer attribution kept: ${s}`)
})

check('tidyFilerName title-cases ALL-CAPS but leaves brand casing alone', () => {
  assert.equal(tidyFilerName('GOLDMAN SACHS GROUP INC'), 'Goldman Sachs Group Inc')
  assert.equal(tidyFilerName('BofA Finance LLC'), 'BofA Finance LLC') // already mixed-case → untouched
})

console.log(`\n${passed} checks passed`)
