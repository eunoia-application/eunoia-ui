import { theme as antdTheme } from 'antd'
import type { ThemeConfig } from 'antd'

import { brand, sharedComponents, sharedToken } from './tokens'

export const darkTheme: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    ...sharedToken,
    // На тёмном фоне зелёный берём чуть светлее для контраста.
    colorPrimary: brand.primaryHover,
    colorInfo: brand.primaryHover,
    colorLink: brand.primaryHover,
    colorBgBase: '#0B0E0D',
    colorBgContainer: '#141917',
    colorBgLayout: '#0B0E0D',
    colorBgElevated: '#181D1B',
    colorText: 'rgba(237, 243, 240, 0.92)',
    colorTextSecondary: 'rgba(237, 243, 240, 0.55)',
    colorBorder: '#242B27',
    colorBorderSecondary: '#1A201D',
  },
  components: {
    ...sharedComponents,
    Layout: {
      bodyBg: '#0B0E0D',
      headerBg: '#0C100E',
      siderBg: '#0C100E',
      headerHeight: 64,
    },
  },
}
