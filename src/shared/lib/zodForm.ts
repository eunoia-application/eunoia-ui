import type { ZodError } from 'zod'

/** Преобразует ошибки zod в формат antd `Form.setFields`. */
export function toFormFields(
  error: ZodError,
): { name: string; errors: string[] }[] {
  const byField = new Map<string, string[]>()
  for (const issue of error.issues) {
    const name = String(issue.path[0] ?? '')
    const list = byField.get(name) ?? []
    list.push(issue.message)
    byField.set(name, list)
  }
  return Array.from(byField, ([name, errors]) => ({ name, errors }))
}
