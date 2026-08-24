import type {
  HistoricalCallState, HistoricalPaperTrade, IbkrPaperPortfolioRead, PaperCallBlock, PaperOpenOrder,
  PaperExecutionResult, PaperPortfolioDifference, PaperPortfolioPosition, PaperPortfolioTargetPosition,
} from './types'

const finiteOrNull = (value: unknown): boolean => value === null || (typeof value === 'number' && Number.isFinite(value))
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const stringOrNull = (value: unknown): boolean => value === null || typeof value === 'string'
const dateOrNull = (value: unknown): boolean => value === null || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value))

function targetPosition(value: unknown): value is PaperPortfolioTargetPosition {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  if (!(typeof row.ticker === 'string' && Boolean(row.ticker) && typeof row.decision === 'string'
    && ['long', 'short'].includes(String(row.side)) && ['low', 'high'].includes(String(row.conviction))
    && finite(row.confidence) && finite(row.model_weight_pct) && typeof row.currency === 'string'
    && stringOrNull(row.exchange) && typeof row.call_id === 'string' && typeof row.decision_date === 'string')) return false
  if (row.confidence < 0 || row.confidence > 100 || ![5, 10].includes(Math.abs(row.model_weight_pct))) return false
  if ((row.side === 'long') !== (row.model_weight_pct > 0)) return false
  return (row.confidence >= 75 ? 'high' : 'low') === row.conviction
}

function actualPosition(value: unknown): value is PaperPortfolioPosition {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  return Number.isInteger(row.contract_id) && Number(row.contract_id) > 0
    && typeof row.symbol === 'string' && Boolean(row.symbol)
    && stringOrNull(row.local_symbol) && stringOrNull(row.security_type) && stringOrNull(row.currency) && stringOrNull(row.exchange)
    && finite(row.quantity) && finiteOrNull(row.average_cost) && finiteOrNull(row.market_price) && finiteOrNull(row.market_value)
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

function blockedCall(value: unknown): value is PaperCallBlock {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  return typeof row.ticker === 'string' && typeof row.decision === 'string' && stringOrNull(row.decision_date)
    && ['provisional', 'unverified', 'missing_frozen_call', 'invalid_decision_date', 'future_call', 'superseded',
      'missing_confidence', 'missing_price', 'missing_currency', 'review_exit', 'review_action_missing',
      'insufficient_cash', 'ambiguous_listing'].includes(String(row.reason))
    && typeof row.detail === 'string'
}

function historicalTrade(value: unknown): value is HistoricalPaperTrade {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  const shape = typeof row.trade_id === 'string' && typeof row.ticker === 'string' && typeof row.decision === 'string'
    && ['long', 'short'].includes(String(row.side)) && ['low', 'high'].includes(String(row.conviction))
    && finite(row.confidence) && finite(row.target_weight_pct) && typeof row.decision_date === 'string'
    && finite(row.entry_price) && typeof row.currency === 'string' && ['open', 'closed'].includes(String(row.status))
    && stringOrNull(row.exit_date) && finiteOrNull(row.exit_price) && typeof row.price_as_of === 'string'
    && finite(row.current_price) && finite(row.position_return_pct) && finite(row.allocated_units) && finite(row.current_value_units)
    && ['decision', 'review', 'later_call'].includes(String(row.mark_source)) && typeof row.detail === 'string'
  if (!shape) return false
  const confidence = row.confidence as number
  const targetWeight = row.target_weight_pct as number
  return confidence >= 0 && confidence <= 100 && [5, 10].includes(targetWeight)
    && (confidence >= 75 ? 'high' : 'low') === row.conviction
}

function historicalCallState(value: unknown): value is HistoricalCallState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  const shape = typeof row.call_id === 'string' && typeof row.ticker === 'string' && typeof row.decision === 'string'
    && stringOrNull(row.decision_date) && finiteOrNull(row.confidence) && stringOrNull(row.side)
    && stringOrNull(row.conviction) && finiteOrNull(row.allocation_pct)
    && ['open', 'closed', 'no_position', 'blocked'].includes(String(row.state))
    && (row.block_reason === null || blockedCall({ ticker: row.ticker, decision: row.decision, decision_date: row.decision_date, reason: row.block_reason, detail: '' }))
    && finiteOrNull(row.entry_price) && stringOrNull(row.currency) && stringOrNull(row.price_as_of)
    && finiteOrNull(row.current_price) && finiteOrNull(row.price_move_pct) && finiteOrNull(row.position_return_pct)
    && finiteOrNull(row.current_value_units) && stringOrNull(row.mark_source)
    && stringOrNull(row.current_action) && stringOrNull(row.current_action_reason)
    && dateOrNull(row.next_check_date) && stringOrNull(row.next_check_label) && typeof row.detail === 'string'
  if (!shape) return false
  if (row.side !== null && !['long', 'short'].includes(String(row.side))) return false
  if (row.conviction !== null && !['low', 'high'].includes(String(row.conviction))) return false
  if (row.mark_source !== null && !['decision', 'review', 'later_call'].includes(String(row.mark_source))) return false
  if (row.confidence !== null && ((row.confidence as number) < 0 || (row.confidence as number) > 100)) return false
  if (row.allocation_pct !== null && ![5, 10].includes(row.allocation_pct as number)) return false
  if (['open', 'closed'].includes(String(row.state))) {
    if (row.confidence === null || row.side === null || row.conviction === null || row.allocation_pct === null || row.position_return_pct === null || row.current_value_units === null || row.block_reason !== null) return false
    if (((row.confidence as number) >= 75 ? 'high' : 'low') !== row.conviction) return false
  } else if (row.allocation_pct !== null || row.position_return_pct !== null || row.current_value_units !== null) return false
  if ((row.state === 'blocked') !== (row.block_reason !== null)) return false
  return true
}

function openOrder(value: unknown): value is PaperOpenOrder {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  const shape = Number.isInteger(row.order_id) && Number(row.order_id) > 0 && Number.isInteger(row.contract_id)
    && typeof row.symbol === 'string' && stringOrNull(row.action) && finiteOrNull(row.total_quantity)
    && stringOrNull(row.order_type) && typeof row.status === 'string' && finite(row.filled) && finite(row.remaining)
    && finiteOrNull(row.average_fill_price) && typeof row.nostra_managed === 'boolean' && typeof row.can_cancel === 'boolean'
  return shape && !(row.can_cancel === true && row.nostra_managed !== true)
}

function automaticExecution(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  if (typeof row.enabled !== 'boolean') return false
  if (row.last_attempt === null) return true
  if (!row.last_attempt || typeof row.last_attempt !== 'object' || Array.isArray(row.last_attempt)) return false
  const attempt = row.last_attempt as Record<string, unknown>
  return attempt && typeof attempt === 'object' && !Array.isArray(attempt)
    && attempt.schema_version === 'ibkr-paper-auto-sync/v1' && typeof attempt.at === 'string'
    && typeof attempt.outcome === 'string' && ['orders_sent', 'aligned', 'no_order', 'error'].includes(attempt.outcome)
    && attempt.trigger === 'publication'
    && stringOrNull(attempt.run_id) && stringOrNull(attempt.run_kind) && stringOrNull(attempt.ticker)
    && typeof attempt.order_count === 'number' && Number.isInteger(attempt.order_count) && attempt.order_count >= 0
    && typeof attempt.skipped_count === 'number' && Number.isInteger(attempt.skipped_count) && attempt.skipped_count >= 0
    && typeof attempt.detail === 'string'
}

/** Deployment-skew boundary: a partial old/new server payload must hide this optional panel, not crash Calls. */
export function publishedPaperPortfolio(value: unknown): IbkrPaperPortfolioRead | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const read = value as any
  if (read.schema_version !== 'ibkr-paper-portfolio/v2' || read.broker !== 'IBKR' || read.mode !== 'paper' || read.paper_only !== true) return null
  if (!['connected', 'disconnected', 'disabled', 'error'].includes(read.status) || typeof read.as_of !== 'string') return null
  if (!read.connection || read.connection.host !== 'localhost' || read.connection.port !== 7497 || typeof read.connection.detail !== 'string') return null
  if (!read.target || typeof read.target.valid !== 'boolean' || typeof read.target.generated_at !== 'string' || !Array.isArray(read.target.positions)
    || !read.target.positions.every(targetPosition) || !Array.isArray(read.target.blocked_calls) || !read.target.blocked_calls.every(blockedCall)
    || typeof read.target.detail !== 'string') return null
  if (read.target.valid) {
    if (read.target.source_path !== 'published Calls history' || !finite(read.target.gross_pct) || !finite(read.target.cash_pct)
      || read.target.gross_pct < 0 || read.target.gross_pct > 100 || read.target.cash_pct < 0 || read.target.cash_pct > 100
      || Math.abs(read.target.gross_pct + read.target.cash_pct - 100) > 0.001
      || Math.abs(read.target.positions.reduce((sum: number, row: PaperPortfolioTargetPosition) => sum + Math.abs(row.model_weight_pct), 0) - read.target.gross_pct) > 0.001) return null
  } else if (!['published Calls history', null].includes(read.target.source_path) || read.target.gross_pct !== null
    || read.target.cash_pct !== null || read.target.positions.length !== 0) return null
  if (!read.history || read.history.schema_version !== 'nostra-paper-history/v2' || typeof read.history.available !== 'boolean' || read.history.unit !== 'normalized_nav'
    || read.history.starting_value !== 100 || !finite(read.history.present_value) || !finite(read.history.cash_value)
    || !finite(read.history.invested_value) || !finite(read.history.total_return_pct)
    || !['calls_examined', 'non_trade_calls', 'trade_calls', 'open_trades', 'closed_trades'].every((key) => Number.isInteger(read.history[key]) && read.history[key] >= 0)
    || !Array.isArray(read.history.call_states) || !read.history.call_states.every(historicalCallState)
    || read.history.call_states.length !== read.history.calls_examined
    || !Array.isArray(read.history.trades) || !read.history.trades.every(historicalTrade)
    || !Array.isArray(read.history.blocked_calls) || !read.history.blocked_calls.every(blockedCall)
    || !read.history.rules || read.history.rules.low_conviction_weight_pct !== 5 || read.history.rules.high_conviction_weight_pct !== 10
    || read.history.rules.high_conviction_min_confidence !== 75 || read.history.rules.provisional_calls_trade !== false
    || !Array.isArray(read.history.rules.eligible_baskets) || read.history.rules.eligible_baskets.length !== 2
    || read.history.rules.eligible_baskets[0] !== 'Selected' || read.history.rules.eligible_baskets[1] !== 'Short'
    || typeof read.history.detail !== 'string') return null
  if (!read.history.available && (read.history.calls_examined !== 0 || read.history.call_states.length !== 0 || read.history.trades.length !== 0 || read.history.blocked_calls.length !== 0)) return null
  if (!read.reconciliation || !['aligned', 'differences', 'unavailable', 'blocked'].includes(read.reconciliation.status)
    || !Array.isArray(read.reconciliation.differences) || !read.reconciliation.differences.every(difference)
    || typeof read.reconciliation.detail !== 'string') return null
  if (!Array.isArray(read.open_orders) || !read.open_orders.every(openOrder)) return null
  if (!read.execution || !['locked', 'ready'].includes(read.execution.status)
    || typeof read.execution.can_execute !== 'boolean'
    || !automaticExecution(read.execution.automatic)
    || read.execution.low_conviction_weight_pct !== 5 || read.execution.high_conviction_weight_pct !== 10
    || read.execution.high_conviction_min_confidence !== 75 || typeof read.execution.detail !== 'string') return null
  if (!Object.prototype.hasOwnProperty.call(read, 'account')) return null
  if (read.execution.status === 'ready' && (read.status !== 'connected' || read.account === null || read.target.valid !== true)) return null
  if (read.execution.can_execute && read.execution.status !== 'ready') return null
  if (read.status === 'connected' && read.account === null) return null
  if (read.account !== null) {
    if (!read.account || typeof read.account !== 'object' || Array.isArray(read.account)) return null
    const account = read.account
    if (!stringOrNull(account.currency) || !finiteOrNull(account.net_liquidation) || !finiteOrNull(account.total_cash)
      || !finiteOrNull(account.gross_position_value) || !finiteOrNull(account.available_funds) || !finiteOrNull(account.buying_power)
      || !finiteOrNull(account.unrealized_pnl) || !finiteOrNull(account.realized_pnl)
      || !Array.isArray(account.positions) || !account.positions.every(actualPosition)) return null
  }
  return read as IbkrPaperPortfolioRead
}

/** A command may have reached TWS during a rolling deploy; never narrate a malformed response as success. */
export function publishedPaperExecutionResult(value: unknown, expectedAction: PaperExecutionResult['action']): PaperExecutionResult | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const read = value as any
  if (read.ok !== true || read.paper_only !== true || read.action !== expectedAction || typeof read.detail !== 'string'
    || !Array.isArray(read.orders) || !Array.isArray(read.skipped)) return null
  if (!read.orders.every((row: any) => row && typeof row === 'object' && Number.isInteger(row.order_id) && row.order_id > 0
    && typeof row.ticker === 'string' && ['BUY', 'SELL'].includes(row.action) && finite(row.quantity) && row.quantity > 0
    && typeof row.status === 'string' && typeof row.detail === 'string')) return null
  if (!read.skipped.every((row: any) => row && typeof row === 'object' && typeof row.ticker === 'string' && typeof row.reason === 'string')) return null
  return read as PaperExecutionResult
}
