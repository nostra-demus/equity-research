import { Component, type ReactNode, type RefObject } from 'react'

type Props = { viewport: RefObject<HTMLElement>; view: string; children: ReactNode }
type Position = { key: string; top: number }[]

/** React's snapshot phase reads the old DOM immediately before a live update.
 * Restore the visible keyed row before paint, even if a scroll event has not fired yet.
 * At the top, follow arrivals; explicit view changes start a new reading position.
 */
export class ReadingAnchor extends Component<Props> {
  getSnapshotBeforeUpdate(previous: Props): Position | null {
    const el = this.props.viewport.current
    if (!el || previous.view !== this.props.view || el.scrollTop <= 1) return null
    const bounds = el.getBoundingClientRect()
    const rows = [...el.querySelectorAll<HTMLElement>('[data-reading-key]')].flatMap((row) => {
      const rect = row.getBoundingClientRect()
      return rect.bottom > bounds.top && rect.top < bounds.bottom
        ? [{ key: row.dataset.readingKey!, top: rect.top }] : []
    })
    const focused = document.activeElement?.closest<HTMLElement>('[data-reading-key]')?.dataset.readingKey
    return rows.sort((a, b) => Number(b.key === focused) - Number(a.key === focused))
  }

  componentDidUpdate(_previous: Props, _state: unknown, saved: Position | null) {
    const el = this.props.viewport.current
    if (!el || !saved) return
    const rows = new Map([...el.querySelectorAll<HTMLElement>('[data-reading-key]')].map((row) => [row.dataset.readingKey, row]))
    // If the first visible row was removed, preserve the next surviving visible row.
    for (const anchor of saved) {
      const row = rows.get(anchor.key)
      if (!row) continue
      const delta = row.getBoundingClientRect().top - anchor.top
      if (Math.abs(delta) > 0.5) el.scrollTop += delta
      break
    }
  }

  render() { return this.props.children }
}
