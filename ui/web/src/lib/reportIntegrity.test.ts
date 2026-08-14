import assert from 'node:assert/strict'
import { reportIntegrityView } from './reportIntegrity'

const heading = '# HAIER — Investment Dossier\n\nThe report starts here.'
const haier = `> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED.**
> scenario math does not match the saved target; the thesis has no SIGN CHECK.
>
> Resolve the flagged items — re-run the synthesizer and re-publish before relying on these numbers.

${heading}`

const haierView = reportIntegrityView(haier)
assert.equal(haierView.body, heading)
assert.ok(haierView.warning)
assert.match(haierView.warning.details, /scenario math does not match/)
assert.match(haierView.warning.details, /Resolve the flagged items/)
assert.doesNotMatch(haierView.body, /PROVISIONAL/)

const tsla = `> [WARNING] **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED.**
> The saved cases do not match.
>
> Resolve the flagged items — re-run the synthesizer and re-publish before relying on these numbers.

# TSLA`
assert.equal(reportIntegrityView(tsla).body, '# TSLA')

const dher = `> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED.**
> The separate evidence check still found material issues.
>
> Resolve the remaining verification findings, re-run the check, and re-publish before relying on this thesis.

# DHER`
assert.equal(reportIntegrityView(dher).body, '# DHER')

const ordinary = '# Clean report\n\nNo warning.'
assert.deepEqual(reportIntegrityView(ordinary), { body: ordinary, warning: null })

const laterQuote = `# Report\n\n> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED.**\n> ordinary quoted evidence`
assert.deepEqual(reportIntegrityView(laterQuote), { body: laterQuote, warning: null })

const malformed = `> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED.**\n> reason without the required resolution line\n\n# Report`
assert.deepEqual(reportIntegrityView(malformed), { body: malformed, warning: null })

console.log('reportIntegrity: 6 checks passed')
