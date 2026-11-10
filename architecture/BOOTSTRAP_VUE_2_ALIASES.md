# BootstrapVue 2 Component Aliases Plan

## Purpose

BootstrapVue (Vue 2) registered 39 component aliases (`BBtn`, `BCheckbox`, `BDd`, …). BootstrapVueNext exports only one of them, `BInput`, and otherwise asks users to rename or define their own aliases through `BootstrapVueNextResolver({aliases})`. This plan adds an **opt-in alias preset** under `bootstrap-vue-next/resolvers` that matches BootstrapVue's aliases for every component that keeps its name in v6, usable both with unplugin-vue-components and with a plain Vue app.

Related upstream issue: [bootstrap-vue-next#1753](https://github.com/bootstrap-vue-next/bootstrap-vue-next/issues/1753) "Implement aliasing system" (closed 2024-05-17). It led to the `BInput` export and the resolver `aliases` option; the maintainer preferred user-maintained aliases over built-in ones. The preset keeps that: nothing is registered unless the user opts in.

Implementation is deferred; it lands in the foundations PR ([#164](https://github.com/VividLemon/bootstrap-vue-next/pull/164)) later.

## Rules (maintainer)

1. Match BootstrapVue's aliases for components whose name does not change in v6.
2. Components renamed or removed in v6 are left out (no `BDd` → `BMenu`).
3. Aliases for components that changed name since BootstrapVue follow the current name's shape: `BBtnClose` (for BootstrapVue's `BButtonClose`) becomes `BCloseBtn` for `BCloseButton`.
4. The aliases live in a resolver preset, `src/resolvers/bootstrapVue2Aliases.ts`, exported from `bootstrap-vue-next/resolvers`, with one export for unplugin-vue-components and one for a Vue app (individual exports in the same file when the code differs). Export names: `bootstrapVue2Aliases` and `bootstrapVue2AliasesPlugin` (see [Decisions](#decisions)).

## Alias list

Source: BootstrapVue `dev` branch, `src/components/*/index.js` plugin `components` maps (no directive aliases exist).

### Included (21)

| Alias                | Component                | BootstrapVue alias                    |
| -------------------- | ------------------------ | ------------------------------------- |
| `BBtn`               | `BButton`                | same                                  |
| `BBtnGroup`          | `BButtonGroup`           | same                                  |
| `BBtnToolbar`        | `BButtonToolbar`         | same                                  |
| `BCloseBtn`          | `BCloseButton`           | `BBtnClose` → `BButtonClose` (rule 3) |
| `BCheck`             | `BFormCheckbox`          | same                                  |
| `BCheckbox`          | `BFormCheckbox`          | same                                  |
| `BCheckGroup`        | `BFormCheckboxGroup`     | same                                  |
| `BCheckboxGroup`     | `BFormCheckboxGroup`     | same                                  |
| `BRadio`             | `BFormRadio`             | same                                  |
| `BRadioGroup`        | `BFormRadioGroup`        | same                                  |
| `BInput`             | `BFormInput`             | same (exported today, see Q2)         |
| `BTextarea`          | `BFormTextarea`          | same                                  |
| `BSelect`            | `BFormSelect`            | same                                  |
| `BSelectOption`      | `BFormSelectOption`      | same                                  |
| `BSelectOptionGroup` | `BFormSelectOptionGroup` | same                                  |
| `BDatalist`          | `BFormDatalist`          | same                                  |
| `BFile`              | `BFormFile`              | same                                  |
| `BRating`            | `BFormRating`            | same                                  |
| `BSpinbutton`        | `BFormSpinbutton`        | same                                  |
| `BFormFeedback`      | `BFormInvalidFeedback`   | same                                  |
| `BNavToggle`         | `BNavbarToggle`          | same                                  |

If a later v6 batch renames one of these targets, its alias is dropped (rule 2), not renamed.

### Left out (18)

| BootstrapVue aliases                                                                                                             | Why                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BDd`, `BDdItem`, `BDdItemBtn`, `BDdItemButton`, `BDropdownItemBtn`, `BDdDivider`, `BDdForm`, `BDdGroup`, `BDdHeader`, `BDdText` | `BDropdown*` → `BMenu*` in v6 (G2 Q1); `BDropdownItemButton` merges into `BMenuItem`, `BDropdownGroup` / `BDropdownForm` are removed                                                          |
| `BNavDd`, `BNavDropdown`, `BNavItemDd`                                                                                           | `BNavItemDropdown` → `BNavItemMenu` (G2 Q1)                                                                                                                                                   |
| `BFormFieldset`                                                                                                                  | `BFormGroup` → `BFormField` (G4 Q1)                                                                                                                                                           |
| `BTag`, `BTags`                                                                                                                  | `BFormTag` / `BFormTags` → `BChip` / `BFormChips` (G4 Q1)                                                                                                                                     |
| `BDatepicker`, `BTimepicker`                                                                                                     | `BFormDatepicker` / `BFormTimepicker` never existed in BootstrapVueNext; v6 replaces the date/time components with `BDatepicker` (which already uses that name) and drops time fields (G4 Q4) |

Note: `BDatepicker` is BootstrapVue's alias name and is also the name of the new v6 component (G4), so it must not be in the preset.

## Design

One source of truth in `src/resolvers/bootstrapVue2Aliases.ts`:

```ts
import type { ComponentType } from "../types/BootstrapVueOptions";

const aliases = {
  BBtn: "BButton",
  BBtnGroup: "BButtonGroup",
  // … the 21 entries above
} as const satisfies Record<string, ComponentType>;
```

### For unplugin-vue-components

`BootstrapVueNextResolver` already accepts `aliases: Record<string, ComponentType>` and resolves an alias to the real component's import path, and unplugin's generated `components.d.ts` types the alias. So the unplugin export is the map itself, which composes with the user's own aliases:

```ts
import { BootstrapVueNextResolver /* unplugin export */ } from "bootstrap-vue-next/resolvers";

Components({
  resolvers: [
    BootstrapVueNextResolver({ aliases: { ...bootstrapVue2Aliases, BMyBtn: "BButton" } }),
  ],
});
```

### For a Vue app

A Vue plugin that registers each alias with `app.component(alias, component)`. The code differs from the unplugin export, so it is a separate export in the same file (rule 4). Two shapes (Q1):

- **Takes the components from the caller** (recommended): `app.use(plugin, Components)` with `import * as Components from 'bootstrap-vue-next/components'`. The resolvers file then imports no component code, which matters because `bootstrap-vue-next/resolvers` is loaded inside `vite.config.ts` (Node), where importing compiled components would load Vue SFC modules into the build process.
- **Imports the 21 target components itself**: `app.use(plugin)`. Simplest call, but the resolvers entry gains component imports that every unplugin user also loads in their bundler config.

Typing: the Vue export adds a `declare module 'vue'` `GlobalComponents` augmentation for the 21 aliases, which applies once the file is imported (as `BvnComponents` does for `createBootstrap`). The unplugin path is typed by unplugin's generated `components.d.ts`.

### Nuxt (optional)

The Nuxt module registers components with `addComponent({name, export, filePath})` from `componentsWithExternalPath`. An alias is one more `addComponent({name: 'BBtn', export: 'BButton', filePath})`, so a Nuxt option such as `aliases: 'bootstrap-vue-2' | Record<string, ComponentType>` could reuse the same map (Q3).

## Changes

- New `packages/bootstrap-vue-next/src/resolvers/bootstrapVue2Aliases.ts` (map, unplugin export, Vue plugin export, `GlobalComponents` augmentation) re-exported from `src/resolvers/index.ts`.
- `BInput` per Q2.
- Spec: every alias target exists in `componentNames`; the resolver resolves an alias to the right `from` path; the Vue plugin registers all aliases.
- Docs: the "Aliasing" section in `apps/docs/src/docs.md` shows both exports; `migration-data/patterns/component-aliases.md` is rewritten from this plan's tables. Its current table is wrong: it says no aliases are registered (`BInput` is), lists targets that don't exist (`BFormDatepicker`, `BFormTimepicker`, `BFormOptionGroup`), and misses `b-btn-close`, `b-check-group`, `b-checkbox-group`, `b-radio`, `b-form-feedback`, `b-form-fieldset`, `b-select-option-group` and `b-spinbutton`.
- `apps/docs/src/docs/migration-data` notes for `BInput` if Q2 removes its export.

## Questions for the maintainer

### Q1. Vue export shape (Medium)

- **A. Plugin that takes the components** (`app.use(plugin, Components)`) (recommended): no component code in the resolvers entry.
- **B. Plugin that imports the 21 components itself** (`app.use(plugin)`): simplest call; component code loads wherever `resolvers` is imported, including bundler configs.

### Q2. The existing `BInput` export (Medium)

- **A. Remove `BInput` from the components export, `componentsWithExternalPath` and `BvnComponentProps`; it lives only in the preset** (recommended). One alias mechanism, in line with #1753's preference for opt-in aliases; breaking changes are allowed in v6.
- **B. Keep the export and also list it in the preset.**

### Q3. Nuxt option (Low)

- **A. Not now**; Nuxt users can add `addComponent` calls or use the Vue plugin.
- **B. Add an `aliases` module option** that reuses the map (recommended if Nuxt migrations are common).

## Decisions

Answered by the maintainer on 2026-11-09.

- **Export names:** `bootstrapVue2Aliases` (the alias map, passed to `BootstrapVueNextResolver({aliases})`) and `bootstrapVue2AliasesPlugin` (the Vue plugin), both exported from `src/resolvers/bootstrapVue2Aliases.ts` and re-exported from `bootstrap-vue-next/resolvers`.
- **Q1 — A.** The plugin takes the components from the caller: `app.use(bootstrapVue2AliasesPlugin, Components)` with `import * as Components from 'bootstrap-vue-next/components'`. The resolvers entry imports no component code.
- **Q2 — A.** `BInput` is removed from the components export, `componentsWithExternalPath` and `BvnComponentProps`; it exists only in the preset. Breaking change with a migration note.
- **Q3 — A.** No Nuxt option now.
