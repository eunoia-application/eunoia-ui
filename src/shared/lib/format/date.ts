import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
dayjs.locale('ru')

const EMPTY = '—'

/** ISO-8601 → «5 июл. 2026». */
export function formatDate(iso?: string, template = 'D MMM YYYY'): string {
  return iso ? dayjs(iso).format(template) : EMPTY
}

/** ISO-8601 → «5 июл. 2026, 14:30». */
export function formatDateTime(iso?: string): string {
  return iso ? dayjs(iso).format('D MMM YYYY, HH:mm') : EMPTY
}

/** ISO-8601 → «2 дня назад». */
export function fromNow(iso?: string): string {
  return iso ? dayjs(iso).fromNow() : EMPTY
}
