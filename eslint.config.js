import js from '@eslint/js'
import boundaries from 'eslint-plugin-boundaries'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/**
 * FSD-слои сверху вниз. Импорт разрешён только в свой слой и ниже.
 * shared — самый нижний, не знает ни о ком.
 */
const LAYER_RULES = [
  { from: 'app', allow: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] },
  { from: 'pages', allow: ['pages', 'widgets', 'features', 'entities', 'shared'] },
  { from: 'widgets', allow: ['widgets', 'features', 'entities', 'shared'] },
  { from: 'features', allow: ['features', 'entities', 'shared'] },
  { from: 'entities', allow: ['entities', 'shared'] },
  { from: 'shared', allow: ['shared'] },
]

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      boundaries,
    },
    settings: {
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'pages', pattern: 'src/pages/**' },
        { type: 'widgets', pattern: 'src/widgets/**' },
        { type: 'features', pattern: 'src/features/**' },
        { type: 'entities', pattern: 'src/entities/**' },
        { type: 'shared', pattern: 'src/shared/**' },
      ],
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'boundaries/element-types': [
        'error',
        { default: 'disallow', rules: LAYER_RULES },
      ],
    },
  },
  {
    // Тесты и тест-утилиты: границы слоёв и any здесь не действуют.
    files: ['**/*.test.{ts,tsx}', 'src/shared/test/**'],
    rules: {
      'boundaries/element-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
)
