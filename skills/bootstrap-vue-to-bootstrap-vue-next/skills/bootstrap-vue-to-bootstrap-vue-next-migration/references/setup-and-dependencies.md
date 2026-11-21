# Setup, dependencies and registration

Sources: BootstrapVue `package.json` (v2.23.1); BootstrapVueNext `packages/bootstrap-vue-next/package.json` (v1.2.2) and
`apps/docs/src/docs.md` (Install / Setup / Tree-shaking), commit `07767892`; re-verified against v1.2.4. The upstream migration guide does **not**
cover most of this page — it is the most common place migrations break first.

## 1. Prerequisites (do these before touching components)

BootstrapVueNext is a rewrite, not a drop-in replacement. The app must already be on (or migrate together to):

- **Vue 3** (`vue ^3.5.13` peer dependency). Work through the Vue 3 breaking changes first:
  `.sync`, `v-model` prop/event names (`value`/`input` → `modelValue`/`update:modelValue`), `slot=`/`slot-scope=`,
  `.native`, filters, `$listeners`, `$on/$off/$once` (event bus), `Vue.extend`, global API → `createApp`.
  `@vue/compat` can help you run Vue 3 during the transition but BootstrapVueNext itself targets plain Vue 3.
- **Bootstrap 5** (`bootstrap ^5.3.0` peer dependency). Bootstrap 4 CSS will not work. See `bootstrap4-to-5-classes.md`.
- **Nuxt 3+** if using Nuxt (BootstrapVue's `bootstrap-vue/nuxt` module is Nuxt 2 only).

## 2. Dependencies

| Remove | Add |
|---|---|
| `bootstrap-vue` | `bootstrap-vue-next` |
| `bootstrap@4` | `bootstrap@^5.3` |
| `popper.js` (if only BV used it) | — (`@floating-ui/vue`, `@vueuse/core`, `reka-ui` come in as dependencies) |
| `portal-vue` (if only BV used it) | — (Vue 3 has `<Teleport>`) |
| `vue-functional-data-merge` | — |
| `vue@2`, `vue-template-compiler`, `@vue/composition-api` | `vue@^3.5` (+ `@vue/compiler-sfc` via your build tool) |
| `bootstrap-vue/nuxt` module | `@bootstrap-vue-next/nuxt` |
| BootstrapVue icons (`IconsPlugin`, `bootstrap-vue/icons`) | `unplugin-icons` + `@iconify-json/bi`, or `bootstrap-icons` |

```bash
npm rm bootstrap-vue popper.js portal-vue
npm i bootstrap@^5.3 bootstrap-vue-next
# optional, for full TypeScript types only (no runtime size):
npm i -D @floating-ui/vue @vueuse/core vue-router
# optional auto-registration + tree-shaking:
npm i -D unplugin-vue-components
```

Optional peer dependencies declared by BootstrapVueNext (all `optional: true`): `@floating-ui/vue`, `@internationalized/date`
(date/time field components), `@vueuse/core`, `@vueuse/integrations`, `focus-trap`, `reka-ui`, `vue-router`.
These exist **for type definitions only**: the published build externalizes nothing but `vue`, so the runtime code of
these packages is already bundled. Features such as the modal focus trap or the date/time fields work without
installing them; install one only if its types resolve to `any`.

## 3. App bootstrapping

### Before (BootstrapVue, Vue 2)

```js
// main.js
import Vue from 'vue'
import {BootstrapVue, IconsPlugin} from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue, {BButton: {variant: 'primary'}}) // global registration + config
Vue.use(IconsPlugin)
new Vue({render: (h) => h(App)}).$mount('#app')
```

### After (BootstrapVueNext, Vue 3) — `BApp` (recommended)

```ts
// main.ts
import {createApp} from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

createApp(App).mount('#app')
```

```vue
<!-- App.vue -->
<template>
  <BApp :defaults="{BButton: {variant: 'primary'}}">
    <RouterView />
  </BApp>
</template>

<script setup lang="ts">
import {BApp} from 'bootstrap-vue-next'
</script>
```

### After — plugin approach (still supported, called "legacy" upstream)

```ts
import {createBootstrap} from 'bootstrap-vue-next/plugins/createBootstrap'
app.use(createBootstrap({components: {BButton: {variant: 'primary'}}}))
```

**One of the two is required.** Without `BApp` or `createBootstrap`, orchestrators (modals/toasts/popovers created
from code), registries and RTL support are missing and the components relying on them silently fail.

**The plugin does not render anything.** `BApp` renders a `<BOrchestrator>` for you; with the plugin approach you must
add one yourself, once, in the root template:

```vue
<template>
  <BOrchestrator />
  <RouterView />
</template>

<script setup lang="ts">
import {BOrchestrator} from 'bootstrap-vue-next'
</script>
```

Until an orchestrator is mounted, `useModal().create()`, `useToast().create()` and `usePopover().create()` throw
"BApp component must be mounted …" (verified in `composables/useModal/index.ts` and `components/BApp/BOrchestrator.vue`).
The upstream docs do not spell this out.

**`useModal()`, `useToast()`, `usePopover()` cannot be called in the same component that renders `<BApp>`** — Vue's
`inject` only reaches descendants. Put `<BApp>` in `App.vue` and call composables in child components/pages.

`BApp` props: `defaults` (per-component prop defaults; key `global` applies to every component with that prop name),
`mergeDefaults`, `teleportTo`, `noOrchestrator`, `appendToast`, `rtl`.

## 4. Component registration

BootstrapVue's `Vue.use(BootstrapVue)` registered every component globally. BootstrapVueNext has **no global
registration plugin**. Pick one:

1. **Explicit imports** (works everywhere): `import {BButton, BModal} from 'bootstrap-vue-next'`.
   Use deep paths for best tree-shaking: `import {BTab} from 'bootstrap-vue-next/components/BTabs'`.
2. **Auto-import with unplugin-vue-components** (closest to the old global experience, still tree-shaken):

   ```ts
   // vite.config.ts
   import Components from 'unplugin-vue-components/vite'
   import {BootstrapVueNextResolver} from 'bootstrap-vue-next/resolvers'
   export default defineConfig({
     plugins: [vue(), Components({resolvers: [BootstrapVueNextResolver({aliases: {BBtn: 'BButton'}})]})],
   })
   ```

   `aliases` lets you keep old alias tags (`<b-btn>`) while you migrate.
3. **Manual global registration** (not documented upstream, plain Vue 3): `app.component('BButton', BButton)` for each
   component you need. Loses tree-shaking.

Directives are imported the same way: `import {vBTooltip} from 'bootstrap-vue-next'` (or via the resolver) and used as
`v-b-tooltip`.

## 5. Nuxt

```bash
npm i bootstrap bootstrap-vue-next @bootstrap-vue-next/nuxt
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@bootstrap-vue-next/nuxt'],
  css: ['bootstrap/dist/css/bootstrap.min.css'],
})
```

See https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/nuxt for module options (`composables`, `css`, …).
The Nuxt page states you **still need `<BApp>` (in `app.vue`) or the plugin approach** so internal services are available.

## 6. CSS / Sass

| BootstrapVue | BootstrapVueNext |
|---|---|
| `bootstrap-vue/dist/bootstrap-vue.css` | `bootstrap-vue-next/dist/bootstrap-vue-next.css` |
| `@import 'bootstrap-vue/src/index.scss'` | `@use 'bootstrap-vue-next/src/styles/styles.scss'` (exported path) |
| `$b-custom-control-*`, `$b-toaster-*`, `$b-icon-*` Sass vars | No equivalents; BootstrapVueNext mostly relies on Bootstrap 5 variables / CSS custom properties |

BootstrapVueNext does not import Bootstrap's CSS for you. For the smallest bundle, use Bootstrap's "lean Sass imports".
Colour mode (`data-bs-theme`) is native in Bootstrap 5.3; see `useBootstrapColorMode()` / `v-b-color-mode`.

## 7. TypeScript

- Types ship with the package; install the optional peers above to avoid `any`.
- Old `BvModalEvent`/`BvEvent` types → `BvTriggerableEvent` / `BvEvent` from `bootstrap-vue-next`.
- Old `this.$refs.modal.show()` still works with template refs, typed via `InstanceType<typeof BModal>` or
  `useTemplateRef`.
