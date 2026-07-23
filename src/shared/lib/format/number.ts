const numberFormat = new Intl.NumberFormat('ru-RU')

/** 1234567 → «1 234 567». Для tabular-цифр в данных. */
export function formatNumber(value?: number): string {
  return typeof value === 'number' ? numberFormat.format(value) : '—'
}

/** 0.42 → «42 %». */
export function formatPercent(value?: number, fractionDigits = 0): string {
  if (typeof value !== 'number') return '—'
  return `${(value * 100).toFixed(fractionDigits)} %`
}
