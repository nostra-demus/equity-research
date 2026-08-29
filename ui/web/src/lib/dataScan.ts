import type { DataScanProgress, DataScanStage } from './types'

const STAGES = new Set<DataScanStage>(['finding', 'reading', 'checking', 'ready', 'failed'])

export function isDataScanProgress(value: unknown): value is DataScanProgress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  return typeof row.scanId === 'string' && typeof row.ticker === 'string'
    && STAGES.has(row.stage as DataScanStage)
    && typeof row.completed === 'number' && Number.isFinite(row.completed) && row.completed >= 0
    && typeof row.total === 'number' && Number.isFinite(row.total) && row.total >= 0
    && (row.currentFile === null || typeof row.currentFile === 'string')
    && (row.error === null || typeof row.error === 'string')
    && typeof row.startedAt === 'number' && typeof row.updatedAt === 'number'
}

export function dataScanPercent(scan: DataScanProgress): number {
  if (scan.stage === 'finding') return 4
  if (scan.stage === 'checking') return 96
  if (scan.stage === 'ready') return 100
  if (scan.stage === 'failed') return scan.total ? Math.round((scan.completed / scan.total) * 90) : 0
  return scan.total ? Math.max(6, Math.min(94, Math.round((scan.completed / scan.total) * 90) + 4)) : 6
}

export function dataScanCopy(scan: DataScanProgress): { title: string; detail: string } {
  if (scan.stage === 'finding') return { title: 'Finding files', detail: `Checking ${scan.ticker}’s folder.` }
  if (scan.stage === 'reading') return {
    title: scan.total ? `Reading file ${Math.min(scan.completed + 1, scan.total)} of ${scan.total}` : 'Reading files',
    detail: scan.currentFile || `${scan.completed} files read`,
  }
  if (scan.stage === 'checking') return { title: 'Checking readiness', detail: `${scan.total} file${scan.total === 1 ? '' : 's'} read.` }
  if (scan.stage === 'ready') return { title: `Ready — ${scan.total} file${scan.total === 1 ? '' : 's'} read`, detail: 'Data and readiness are up to date.' }
  return { title: 'Reading stopped', detail: scan.error || 'The files could not be read.' }
}
