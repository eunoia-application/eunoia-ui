import type { ThemeConfig } from 'antd'

/**
 * Брендовая «садовая» палитра — единственный акцент продукта.
 * Всё остальное держим нейтральным (стиль Linear / Stripe / Vercel).
 */
export const brand = {
  primary: '#2F6F4F',
  primaryHover: '#3D8B63',
  primaryActive: '#24563D',
  primarySoft: 'rgba(47, 111, 79, 0.10)',
} as const

export const fontFamily =
  '"Manrope Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export const fontFamilyCode =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'

/** Seed-токены, общие для обеих тем. */
export const sharedToken: ThemeConfig['token'] = {
  colorPrimary: brand.primary,
  colorInfo: brand.primary,
  colorLink: brand.primary,
  borderRadius: 8,
  borderRadiusLG: 12,
  borderRadiusSM: 6,
  controlHeight: 40,
  fontFamily,
  fontFamilyCode,
  fontSize: 14,
  lineHeight: 1.6,
  wireframe: false,
}

/** Компонентные настройки, общие для обеих тем. */
export const sharedComponents: ThemeConfig['components'] = {
  Button: {
    primaryShadow: 'none',
    defaultShadow: 'none',
    dangerShadow: 'none',
    fontWeight: 600,
  },
  Menu: {
    itemBorderRadius: 8,
    itemHeight: 40,
    itemMarginInline: 8,
  },
  Form: {
    itemMarginBottom: 20,
  },
}
