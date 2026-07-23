import { z } from 'zod'

/**
 * Русские сообщения по умолчанию для zod. Вызывается один раз на старте.
 * Кастомные сообщения в схемах (`.email(...)`, `.min(n, ...)`) имеют приоритет;
 * этот map покрывает дефолты — прежде всего «обязательное поле» (undefined).
 */
export function setupZodRu(): void {
  z.setErrorMap((issue, ctx) => {
    switch (issue.code) {
      case z.ZodIssueCode.invalid_type:
        if (issue.received === 'undefined' || issue.received === 'null') {
          return { message: 'Обязательное поле' }
        }
        return { message: 'Некорректное значение' }
      case z.ZodIssueCode.too_small:
        if (issue.type === 'string') {
          return {
            message:
              issue.minimum === 1
                ? 'Обязательное поле'
                : `Минимум ${issue.minimum} символов`,
          }
        }
        return { message: ctx.defaultError }
      default:
        return { message: ctx.defaultError }
    }
  })
}
