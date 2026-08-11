import assert from 'node:assert/strict'
import { api } from './api'
import { useStore } from './store'
import type { ScreenerBoard } from './types'

const original = api.screenerBoard
const originalActiveSwarm = useStore.getState().activeSwarm
const emptyBoard = {
  generated_at: null, inbox: [], signals: [], theses: [], handoffs: [], ideas: [], counts: {}, resumable: [],
} as ScreenerBoard

try {
  useStore.setState({
    activeSwarm: 'screener',
    scBoard: null,
    scBoardFetch: { status: 'idle', error: null, lastSuccessAt: null },
  })
  api.screenerBoard = async () => emptyBoard
  await useStore.getState().scRefreshBoard()
  assert.equal(useStore.getState().scBoard, emptyBoard)
  assert.equal(useStore.getState().scBoardFetch.status, 'ready')
  assert.equal(typeof useStore.getState().scBoardFetch.lastSuccessAt, 'number')

  const lastSuccessAt = useStore.getState().scBoardFetch.lastSuccessAt
  api.screenerBoard = async () => { throw new Error('engine unreachable') }
  await useStore.getState().scRefreshBoard()
  assert.equal(useStore.getState().scBoard, emptyBoard, 'a failed refresh preserves the last good board')
  assert.deepEqual(useStore.getState().scBoardFetch, {
    status: 'error', error: 'engine unreachable', lastSuccessAt,
  })

  let resolveRetry!: (board: ScreenerBoard) => void
  api.screenerBoard = () => new Promise<ScreenerBoard>((resolve) => { resolveRetry = resolve })
  const retry = useStore.getState().scRefreshBoard()
  assert.deepEqual(useStore.getState().scBoardFetch, {
    status: 'refreshing', error: 'engine unreachable', lastSuccessAt,
  }, 'a background retry keeps the prior error visible until success')
  resolveRetry(emptyBoard)
  await retry
  assert.equal(useStore.getState().scBoardFetch.status, 'ready')
  assert.equal(useStore.getState().scBoardFetch.error, null)

  useStore.setState({ scBoard: null, scBoardFetch: { status: 'idle', error: null, lastSuccessAt: null } })
  api.screenerBoard = async () => { throw new Error('engine unreachable') }
  await useStore.getState().scRefreshBoard()
  assert.equal(useStore.getState().scBoardFetch.status, 'error', 'cold fetch failures are explicit')
  assert.equal(useStore.getState().scBoardFetch.lastSuccessAt, null)

  const oldBoard = { ...emptyBoard, generated_at: 'old' } as ScreenerBoard
  const newBoard = { ...emptyBoard, generated_at: 'new' } as ScreenerBoard
  let resolveOld!: (board: ScreenerBoard) => void
  api.screenerBoard = () => new Promise<ScreenerBoard>((resolve) => { resolveOld = resolve })
  const olderRequest = useStore.getState().scRefreshBoard()
  api.screenerBoard = async () => newBoard
  await useStore.getState().scRefreshBoard()
  resolveOld(oldBoard)
  await olderRequest
  assert.equal(useStore.getState().scBoard?.generated_at, 'new', 'a late older response cannot replace newer board truth')

  console.log('ideas board fetch: ready, stale-data error, and cold error states passed')
} finally {
  api.screenerBoard = original
  useStore.setState({ activeSwarm: originalActiveSwarm })
}
