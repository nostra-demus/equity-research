// Stick-to-bottom decision for the thread. Desktop uses a 48px threshold; touch momentum scrolling
// overshoots far more than a wheel, so the phone uses 96px — inside that band the thread keeps
// following the stream, outside it the user has scrolled up to read and we must not yank them back.
export const STICK_THRESHOLD_PX = 96

export function shouldStick(scrollTop: number, scrollHeight: number, clientHeight: number, threshold = STICK_THRESHOLD_PX): boolean {
  return scrollHeight - scrollTop - clientHeight <= threshold
}
