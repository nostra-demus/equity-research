import assert from 'node:assert/strict'
import { CADENCE_LABEL } from './labels'

for (const cadence of [
  'twelve_hourly', 'daily', 'weekly', 'monthly',
  'quarterly', 'semiannual', 'annual', 'event_driven',
]) {
  assert.ok(CADENCE_LABEL[cadence], `missing user-facing label for ${cadence}`)
}

console.log('labels.test.ts: complete connector cadence vocabulary labelled')
