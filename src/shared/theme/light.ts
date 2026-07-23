import { theme as antdTheme } from 'antd'
import type { ThemeConfig } from 'antd'

import { sharedComponents, sharedToken } from './tokens'

export const lightTheme: ThemeConfig = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    ...sharedToken,
    colorBgBase: '#FFFFFF',
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F6F7F7',
    colorBgElevated: '#FFFFFF',
    colorText: '#1B241F',
    colorTextSecondary: '#5C6B63',
    colorBorder: '#E6EAE8',
    colorBorderSecondary: '#EEF1EF',
  },
  components: {
    ...sharedComponents,
    Layout: {
      bodyBg: '#F6F7F7',
      headerBg: '#FFFFFF',
      siderBg: '#FFFFFF',
      headerHeight: 64,
    },
  },
}
