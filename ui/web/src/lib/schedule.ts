// Client mirror of the server's forward/scheduled-event LABELS (server: ui/server/src/news/schedule.ts
// SCHEDULED_EVENTS[id].label). The server flags each wire item with the scheduled corporate events it
// announces (results date, AGM, ex-dividend, …); the client renders them as a 📅 forward-catalyst chip.
// Keep in lockstep with the server labels (short, stable). The facets API also carries {key,label}.
export const SCHEDULED_EVENT_LABELS: Record<string, string> = {
  results_date: 'Results date',
  shareholder_meeting: 'AGM / EGM',
  ex_dividend: 'Ex-dividend',
  investor_day: 'Investor day',
  lockup_expiry: 'Lock-up expiry',
  index_change: 'Index change',
}

/** Plain label for a scheduled-event kind (falls back to the id, so a newer kind still renders). */
export const scheduledEventLabel = (id: string): string => SCHEDULED_EVENT_LABELS[id] ?? id
