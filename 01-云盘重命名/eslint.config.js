import antfu from '@antfu/eslint-config'

export default antfu({
  unocss: true,
  ignores: ['dist/**', 'test/**/*.cjs', 'test-results/**', 'playwright-report/**'],
})
