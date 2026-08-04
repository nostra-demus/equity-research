// Run: npx tsx src/lib/rovingRadio.test.ts
import assert from 'node:assert/strict'
import { nextRovingRadioIndex, rovingRadioTabStopIndex } from './rovingRadio'

const enabled = [true, false, true, false, true]

assert.equal(nextRovingRadioIndex('ArrowRight', 0, enabled), 2, 'right skips a disabled radio')
assert.equal(nextRovingRadioIndex('ArrowDown', 4, enabled), 0, 'forward navigation wraps')
assert.equal(nextRovingRadioIndex('ArrowLeft', 0, enabled), 4, 'backward navigation wraps')
assert.equal(nextRovingRadioIndex('ArrowUp', 4, enabled), 2, 'up skips a disabled radio')
assert.equal(nextRovingRadioIndex('Home', 4, enabled), 0)
assert.equal(nextRovingRadioIndex('End', 0, enabled), 4)
assert.equal(nextRovingRadioIndex('Tab', 0, enabled), null, 'Tab leaves the group normally')
assert.equal(nextRovingRadioIndex('ArrowRight', 1, enabled), 0, 'a stale disabled selection recovers to an enabled choice')
assert.equal(nextRovingRadioIndex('ArrowRight', 0, [true]), 0, 'a single enabled choice remains selected')
assert.equal(nextRovingRadioIndex('ArrowRight', 0, [false, false]), null)

assert.equal(rovingRadioTabStopIndex(2, enabled), 2, 'the selected enabled radio is the sole tab stop')
assert.equal(rovingRadioTabStopIndex(1, enabled), 0, 'a selected disabled window falls back to the first enabled radio')
assert.equal(rovingRadioTabStopIndex(-1, enabled), 0)
assert.equal(rovingRadioTabStopIndex(0, [false, false]), -1)

console.log('roving radio: keyboard navigation and disabled-option handling passed')
