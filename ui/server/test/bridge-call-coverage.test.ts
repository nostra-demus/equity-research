process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { mergeBridgeSubjects } from '../src/bridge-scheduler'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-calls-'))
try {
  fs.mkdirSync(path.join(root, 'AMZN'))
  fs.mkdirSync(path.join(root, 'HAIER'))
  const subjects = mergeBridgeSubjects(
    ['NHY'],
    [{ ticker: 'AMZN' }, { ticker: 'HAIER' }, { ticker: 'AMZN' }, { ticker: '../escape' },
      { ticker: '..' }, { ticker: '.' }, { ticker: 'lower' }, { ticker: 'NO_POOL' }],
    root,
  )
  assert.deepEqual(subjects, ['AMZN', 'HAIER', 'NHY'])
  console.log('ok  every standing call with a research pool joins automatic news coverage')
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}
