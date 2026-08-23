import type { IbkrPaperPortfolioRead, PaperPortfolioDifference, PaperPortfolioPosition, PaperPortfolioTargetPosition } from './types'

const finiteOrNull = (value: unknown): boolean => value === null || (typeof value === 'number' && Number.isFinite(value))
const stringOrNull = (value: unknown): boolean => value === null || typeof value === 'string'

function targetPosition(value: unknown): value is PaperPortfolioTargetPosition {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  return typeof row.ticker === 'string' && Boolean(row.ticker)
    && stringOrNull(row.decision)
    && typeof row.model_weight_pct === 'number' && Number.isFinite(row.model_weight_pct)
}

function actualPosition(value: unknown): value is PaperPortfolioPosition {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  return typeof row.symbol === 'string' && Boolean(row.symbol)
    && stringOrNull(row.local_symbol) && stringOrNull(row.security_type) && stringOrNull(row.currency) && stringOrNull(row.exchange)
    && typeof row.quantity === 'number' && Number.isFinite(row.quantity)
    && finiteOrNull(row.average_cost) && finiteOrNull(row.market_price) && finiteOrNull(row.market_value)
    && finiteOrNull(row.unrealized_pnl) && finiteOrNull(row.realized_pnl) && finiteOrNull(row.portfolio_weight_pct)
}

function difference(value: unknown): value is PaperPortfolioDifference {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  return ['missing_position', 'unexpected_position', 'weight_mismatch'].includes(String(row.kind))
    && typeof row.ticker === 'string' && Boolean(row.ticker)
    && finiteOrNull(row.target_weight_pct) && finiteOrNull(row.actual_weight_pct)
    && typeof row.detail === 'string'
}

/** Deployment-skew boundary: a partial old/new server payload must hide this optional panel, not crash Calls. */
export function publishedPaperPortfolio(value: unknown): IbkrPaperPortfolioRead | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const read = value as any
  if (read.schema_version !== 'ibkr-paper-portfolio/v1' || read.broker !== 'IBKR' || read.mode !== 'paper' || read.read_only !== true) return null
  if (!['connected', 'disconnected', 'disabled', 'error'].includes(read.status) || typeof read.as_of !== 'string') return null
  if (!read.connection || read.connection.host !== 'localhost' || read.connection.port !== 7497 || typeof read.connection.detail !== 'string') return null
  if (!read.target || typeof read.target.valid !== 'boolean' || !stringOrNull(read.target.source_path) || !stringOrNull(read.target.generated_at)
    || !finiteOrNull(read.target.gross_pct) || !finiteOrNull(read.target.cash_pct) || !Array.isArray(read.target.positions)
    || !read.target.positions.every(targetPosition) || typeof read.target.detail !== 'string') return null
  if (!read.reconciliation || !['aligned', 'differences', 'unavailable', 'blocked'].includes(read.reconciliation.status)
    || !Array.isArray(read.reconciliation.differences) || !read.reconciliation.differences.every(difference)
    || typeof read.reconciliation.detail !== 'string') return null
  if (!read.execution || read.execution.status !== 'locked' || typeof read.execution.detail !== 'string') return null
  if (read.account !== null) {
    const account = read.account
    if (!stringOrNull(account.currency) || !finiteOrNull(account.net_liquidation) || !finiteOrNull(account.total_cash)
      || !finiteOrNull(account.gross_position_value) || !finiteOrNull(account.available_funds) || !finiteOrNull(account.buying_power)
      || !finiteOrNull(account.unrealized_pnl) || !finiteOrNull(account.realized_pnl)
      || !Array.isArray(account.positions) || !account.positions.every(actualPosition)) return null
  }
  return read as IbkrPaperPortfolioRead
}
