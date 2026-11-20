import {defineConfig} from 'vite-plus'

// Workspace-wide lint and format settings (https://viteplus.dev/guide/monorepo).
// `vp lint`, `vp fmt` and `vp check` only read this root config; package vite.config.ts files
// keep their Vite, Vitest and framework settings. Package differences go in `overrides`.
export default defineConfig({
  fmt: {
    // Mirrors .prettierrc.yaml, which governs packages/bootstrap-vue-next and packages/nuxt
    // (Prettier still runs through lint-staged there; packages/nuxt is also styled by ESLint Stylistic)
    bracketSpacing: false,
    printWidth: 100,
    quoteProps: 'consistent',
    semi: false,
    singleQuote: true,
    trailingComma: 'es5',
    overrides: [
      {files: ['**/*.css', '**/*.scss', '**/*.html'], options: {singleQuote: false}},
      {files: ['**/demo/*.*'], options: {singleAttributePerLine: true}},
      {
        // The docs and playground apps were formatted by Oxfmt with only `semi: false` and
        // `singleQuote: true` (their old .oxfmtrc.json); restore Oxfmt's defaults for the rest
        files: ['apps/docs/**', 'apps/playground/**'],
        options: {
          bracketSpacing: true,
          printWidth: 100,
          quoteProps: 'as-needed',
          singleAttributePerLine: false,
          singleQuote: true,
          trailingComma: 'all',
        },
      },
    ],
  },
  lint: {
    // Same settings each package's .oxlintrc.json had (packages/bootstrap-vue-next, apps/docs,
    // apps/playground); not type-aware, since vue-tsc type-checks each package
    plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'vue', 'vitest'],
    env: {browser: true},
    categories: {correctness: 'error'},
    // templates/vite is the consumer StackBlitz starter for pkg-pr-new (plain Vite, not a
    // workspace member); docs demos were ignored by apps/docs/.oxlintrc.json. packages/mcp
    // (ESLint only) and the architecture/ prototype scripts never ran Oxlint
    ignorePatterns: ['templates/**', 'apps/docs/**/demo/**', 'packages/mcp/**', 'architecture/**'],
    jsPlugins: [{name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin'}],
    rules: {'vite-plus/prefer-vite-plus-imports': 'error'},
  },
})
