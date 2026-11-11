# Externalize Runtime Dependencies Plan

## Purpose

Fixes [bootstrap-vue-next#2104](https://github.com/bootstrap-vue-next/bootstrap-vue-next/issues/2104) ("Provide distributed module that doesn't bundle external packages").

The library build marks only `vue` as external (`rollupOptions.external: ['vue']` in `packages/bootstrap-vue-next/vite.config.ts`). Every other runtime dependency is copied into `dist`: `@vueuse/core` / `@vueuse/shared` / `@vueuse/integrations`, `@floating-ui/*`, `focus-trap` / `tabbable`, `reka-ui` and its dependencies (`@internationalized/date`, `defu`, `ohash`, `aria-hidden`). An app that also uses vueuse or Floating UI ends up with two copies of the same code, and the app's copy (with its bug fixes) is never the one the library runs. At the same time `@vueuse/core`, `@floating-ui/vue` and `reka-ui` are listed in `dependencies`, so npm installs them for every user although the library never imports them at runtime.

Decision (maintainer, 2026-11-09): **externalize the runtime dependencies in the one and only build**, keep them in `dependencies` so they are installed automatically, and widen their ranges so package managers can share one copy with the app. No second `/slim` build.

## Why not a `/slim` build

A second Vite build (`vite build --mode slim` with a wider `external` list, `outDir: 'dist/slim'`, and `./slim` / `./slim/components/*` exports) works, but:

- An app that imports from both `bootstrap-vue-next` and `bootstrap-vue-next/slim` gets two copies of the library with different injection keys, so `BApp` from one doesn't provide to components from the other.
- The Nuxt module and the component resolvers need an option to choose the build.
- npm can't make a dependency required only for one entry point, so slim users install the packages by hand.
- Every subpath export is maintained twice and the published package roughly doubles.

Externalizing in the single build gets the same deduplication without any of these.

## How deduplication works

With a package in `external`, `dist` keeps `import {useEventListener} from '@vueuse/core'` instead of inlining the code. The user's bundler resolves that import from `node_modules`, like it does for `vue`. Because the package is in our `dependencies`, it is always installed, so the import always resolves.

| Situation                                                      | Result                                                                 |
| -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| App doesn't use the package                                    | One copy (installed as our dependency); bundle size unchanged          |
| App's version satisfies our range (we `^14.2.1`, app `14.3.0`) | One shared copy; the app's bug fixes reach the library; smaller bundle |
| App's version is outside our range (app `15.x`)                | Two copies, as today                                                   |

npm and yarn deduplicate compatible versions on install; pnpm usually does too, and `pnpm dedupe` / `npm dedupe` merges a stale lockfile copy. The library's tested compatibility is expressed by the `dependencies` range, exactly as `peerDependencies.vue` does for Vue.

## Prototype measurements

Measured on `main` at `07767892` (1.2.2). Upstream `main` (1.2.3) only adds an orchestrator fix on top, with identical dependencies and build config, so the numbers carry over; the v6 branch has the same dependency list.

Prototype: the existing `vite.config.ts` merged with `external: [/^@vueuse\//, /^@floating-ui\//, /^focus-trap(\/|$)/, /^reka-ui(\/|$)/, /^@internationalized\//, /^vue-router(\/|$)/]` (plus a Sass alias needed only in this checkout, see [Notes](#notes)).

**Published `dist` JavaScript** (unminified, as published):

| Build              | Files | Raw      | gzip -9 |
| ------------------ | ----- | -------- | ------- |
| Today (`vue` only) | 181   | 1,390 KB | 277 KB  |
| Externalized       | 170   | 730 KB   | 139 KB  |

The externalized `dist` imports only `vue`, `@vueuse/core`, `@vueuse/integrations/useFocusTrap`, `@floating-ui/vue` and `reka-ui`; its source maps list no `node_modules` files.

**Sample app bundle** (Vite production build, minified, includes Vue itself). The app uses two components that depend on vueuse / Floating UI, `BModal` (`onKeyStroke`, focus trap) and `BTooltip` (Floating UI, `onClickOutside`), imported through their subpath entries:

| App                                                                                                          | Today                     | Externalized       | Difference                             |
| ------------------------------------------------------------------------------------------------------------ | ------------------------- | ------------------ | -------------------------------------- |
| Only the two components                                                                                      | 165.9 KB raw / 58.0 KB gz | 165.9 KB / 58.0 KB | none                                   |
| Same, plus the app's own `onClickOutside`, `onKeyStroke`, `useElementSize` and `useFloating` (same versions) | 182.6 KB raw / 61.9 KB gz | 167.4 KB / 58.5 KB | −15.2 KB raw (−8%), −3.4 KB gz (−5.5%) |

The saving grows with how much vueuse and Floating UI the app and the library both use; an app that uses neither sees no change, as expected.

## Changes (v6 branch)

1. **`vite.config.ts`**: derive `external` from `package.json` so the list can't drift:

   ```ts
   import pkg from "./package.json" with { type: "json" };

   const runtimeDeps = [
     ...Object.keys(pkg.dependencies ?? {}),
     ...Object.keys(pkg.peerDependencies ?? {}),
   ];
   // `vue` and subpaths such as `@vueuse/integrations/useFocusTrap`
   const external = (id: string) =>
     runtimeDeps.some((dep) => id === dep || id.startsWith(`${dep}/`));
   ```

   `bootstrap` (Sass only) is never imported from JS, so including peers is harmless.

2. **`package.json`**:
   - `dependencies` holds every package imported at runtime: `@vueuse/core`, `@floating-ui/vue`, plus `@vueuse/integrations` and `focus-trap` while `BModal` / `BOffcanvas` still use `useActivatedFocusTrap` (the v6 Dialog work removes them, G1 Q9), and `reka-ui` until the v6 Combobox / OTP / Datepicker work removes it (G2, G4). `@floating-ui/core` stays only if imported directly.
   - Widen ranges to caret: `@vueuse/core: ^14.2.1` (today `~14.2.1`, which blocks deduplication with any 14.3+ app).
   - Remove from optional `peerDependencies` every package that is now in `dependencies`; keep `vue` (required) and `vue-router` (optional, type-only). `vanilla-calendar-pro` stays a required peer as decided in G4 Q5; it is external through the same rule.
   - `@internationalized/date` stays an optional peer while reka-ui is used (reka-ui depends on it itself).

3. **Nuxt module** (`packages/nuxt`): it already adds `bootstrap-vue-next` to `vite.optimizeDeps.include`; check that dev prebundling and the SSR build resolve the external packages (no `transpile` change expected).

4. **Docs**: a short note on the installation page that the library's dependencies are shared with the app when versions match, and a migration-data note that `dist` no longer contains vueuse / Floating UI (no user action needed).

## Verification

- `pnpm --filter bootstrap-vue-next run build`, then confirm `dist` imports the externals and the source maps list no `node_modules` paths.
- `publint` (`pnpm --filter bootstrap-vue-next run publint`).
- The required checks in `BOOTSTRAP_V6_MIGRATION.md`, including `npx turbo run build --force` (docs site, playground, Nuxt playground).
- Repeat the sample-app measurement above against the v6 build and record it in the PR.

## Notes

- Building `main` inside a worktree nested in a v6 checkout picked up the parent checkout's Bootstrap 6 Sass (Vite's Sass importer walked out of the worktree), so the prototype pinned `bootstrap/scss/` with an alias. This is a local-environment quirk, not a product change.
- `reka-ui` itself bundles nothing for us, but while it was inlined into `dist` its own vueuse imports were inlined too; externalizing it lets those share the app's copy as well.
