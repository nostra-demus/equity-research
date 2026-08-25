#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { backup, DatabaseSync } from 'node:sqlite'

const [source, destination] = process.argv.slice(2)

function fail(message) {
  process.stderr.write(`news-queue-snapshot: ${message}\n`)
  process.exitCode = 1
}

if (!source || !destination) {
  fail('usage: news-queue-snapshot.mjs SOURCE.sqlite DESTINATION.sqlite')
} else if (!fs.existsSync(source)) {
  fail(`source does not exist: ${source}`)
} else {
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  let sourceDb
  let snapshotDb
  try {
    sourceDb = new DatabaseSync(source, { readOnly: true })
    const sourceCheck = sourceDb.prepare('PRAGMA quick_check').get()
    if (sourceCheck?.quick_check !== 'ok') throw new Error(`source quick_check: ${String(sourceCheck?.quick_check)}`)
    const schema = sourceDb.prepare("SELECT value FROM news_queue_meta WHERE key = 'schema_version'").get()
    const bootstrapped = sourceDb.prepare("SELECT value FROM news_queue_meta WHERE key = 'bootstrap_complete'").get()
    if (schema?.value !== '1' || bootstrapped?.value !== '1') throw new Error('source queue is not bootstrapped schema 1')

    await backup(sourceDb, destination, { rate: 64 })
    snapshotDb = new DatabaseSync(destination, { readOnly: true })
    const snapshotCheck = snapshotDb.prepare('PRAGMA quick_check').get()
    if (snapshotCheck?.quick_check !== 'ok') throw new Error(`snapshot quick_check: ${String(snapshotCheck?.quick_check)}`)
    const counts = snapshotDb.prepare(`
      SELECT state, COUNT(*) AS count FROM news_queue GROUP BY state ORDER BY state
    `).all()
    fs.chmodSync(destination, 0o600)
    process.stdout.write(`${JSON.stringify({ schema: 1, counts })}\n`)
  } catch (error) {
    try { fs.rmSync(destination, { force: true }) } catch { /* best effort */ }
    fail(error?.message || String(error))
  } finally {
    try { snapshotDb?.close() } catch { /* best effort */ }
    try { sourceDb?.close() } catch { /* best effort */ }
  }
}
