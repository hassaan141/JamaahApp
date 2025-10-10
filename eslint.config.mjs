import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

export default [
  { ignores: ['node_modules', 'build', 'dist', '.expo'] },

  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { react: reactPlugin, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  prettier,
]
