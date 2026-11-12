# Docs from source: feasibility investigation

Status: research only, nothing in the docs pipeline was changed. Based on
`origin/bootstrap-v6-foundations` @ `70505ee30`. Prototype scripts and raw output are in
[`docs-from-source-prototype/`](./docs-from-source-prototype/) (throwaway prototype, kept for reference; run with
`node <script>.cjs <path-to-packages/bootstrap-vue-next>`, needs `vue-component-meta`,
`typescript@6`, `jiti`).

## TL;DR

**Recommendation: adopt `vue-component-meta` for extraction, plus a small in-repo layer (~400–600
lines) for type linking and the two gaps it has. Do not build a general extractor, do not publish a
package yet.** It is practical: the whole library extracts in ~2.3 s cold, an edit re-extracts in
~60 ms, and declared type text can be turned into links with the TS checker reliably.

The real cost is not tooling, it is the content move: ~1,600 hand-written descriptions, many of
them written per component for props that are declared once on a shared interface. Plan on
**2–3 weeks of part-time work**, most of it reviewing the description migration. Start with a
generate-and-diff tool (2–3 days), which pays off on its own: it already finds stale docs today.

## What exists today

| | Count |
| --- | --- |
| `apps/docs/src/data/components/*.data.ts` files | 49 (9,386 lines) |
| Components documented | 108 (of 117 `B*.vue` files) |
| `description:` entries in component data files | 1,370 |
| `description:` entries in shared utils (`commonProps`, `linkProps`, `showHideData`, …) | 233 |
| `buildCommonProps(...)` uses / per-component overrides of a shared entry | 95 / 36 |
| Defaults stored as non-strings (`// TODO item not in string format`) | 114 |
| Descriptions with markdown links into the docs | 37 |
| Components with `styleSpec` | 56 |
| JSDoc blocks today in `ComponentProps.ts` / `ComponentSlots.ts` / `ComponentEmits.ts` | 7 / 0 / 0 |

Props types live in `src/types/ComponentProps.ts`, often composed via `extends` and `Omit<>`
(`BAlertProps extends ColorExtendables, Omit<BLinkProps, 'routerTag'>, ShowHideProps`). Components
use `withDefaults(defineProps<Omit<BXProps, 'modelValue'>>(), {...})` then `useDefaults(_props, 'BX')`,
plus `defineModel` for v-models. `BTable` is `generic="Item"`.

## 1. Existing tools

Tested on real components (BRow, BCol, BModal, BTable, then the full library):

| Tool | Props + JSDoc | `withDefaults` | Through `Omit<>`/`extends` | Generics (`BTable<Item>`) | Slots + scope types | Emits + payload | Types in separate `.ts` | Type links |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **vue-component-meta 3.3.14** (Volar; used by Nuxt, Histoire, Storybook) | ✅ incl. `@example`/`@see`/`@since`/`@deprecated` as `tags` | ✅ as source text (`"div"`) | ✅ | ✅ keeps `Item` | ✅ names, scope type, JSDoc | ✅ names + payload; ❌ JSDoc on tuple-style emits | ✅ | ❌ (gives `getDeclarations()` + `ts.Type`, you build links) |
| **vue-docgen-api 4.79** | ✅ only for plain `defineProps<Iface>()` | ✅ | ❌ BModal/BTable: only the `withDefaults` keys, no types, no descriptions | ❌ | partial (from template, empty bindings) | names only | partial | ❌ |
| **TypeDoc** (+ vue plugins) | ✅ on the `.ts` types | ❌ (no `.vue` defaults) | ✅ | ✅ | only as raw types | only as raw types | ✅ | ✅ but in its own site/JSON model |
| **TS compiler API / ts-morph** | ✅ | you parse `withDefaults` yourself | ✅ | ✅ | you rebuild Vue's slot/emit/model rules | same | ✅ | ✅ (prototype below) |

Not worth pursuing: `vue-docgen-api` (breaks on this codebase's `Omit<>` pattern), TypeDoc (no defaults,
no Vue semantics, a second docs site). Raw TS/ts-morph would mean re-implementing what Volar already
does for `defineModel`, `defineSlots`, generics and `useDefaults`-style wrappers.

### Actual vue-component-meta output

BRow (with a throwaway JSDoc on `gutterX`):

```json
{
  "name": "gutterX",
  "type": "Partial<Record<ResponsiveKey, GutterNumbers>> | undefined",
  "default": "undefined",
  "description": "Horizontal gutter, 0 to 12 on the spacing scale (`{ xs: 3, md: 5 }` renders `gx-3 md:gx-5`).",
  "tags": [
    { "name": "example", "text": "<BRow :gutter-x=\"{ xs: 3, md: 5 }\" />" },
    { "name": "see", "text": "https://getbootstrap.com/docs/6.0/layout/gutters/" },
    { "name": "since", "text": "0.40.0" }
  ],
  "decl": "src/types/ComponentProps.ts:41728"
}
```

BModal (58 props, 14 events, 8 slots, 2 exposed), excerpts:

```
P okVariant  | keyof BaseButtonVariant | null | undefined    | default "solid"   (+ @deprecated tag works)
P size       | keyof BaseSize | "xl" | undefined              | default undefined
P teleportTo | string | RendererElement | null | undefined    | default "body"
P modelValue | boolean | undefined                           | default false     (from defineModel)
E ok         | (event: "ok", value: BvTriggerableEvent): void   description: ""  ← JSDoc lost
S footer     | BModalSlotsData   description: "Replaces the whole footer, ..."   ← JSDoc kept
X hide       | (trigger?: string, noTriggerEmit?: boolean) => Promise<...>
```

BTable (77 props, 19 events, 12 slots), generic `Item` preserved:

```
P fields       | readonly TableFieldRaw<Item>[] | undefined     | default []
P provider     | BTableProvider<Item> | undefined
P tbodyTrClass | TableStrictClassValue | ((item: Item | null, type: TableRowType) => TableStrictClassValue)
E filtered     | [value: readonly Item[]]
S row-expansion| { item: Item; toggleExpansion: () => void; fields: TableField<Item>[]; index: number; ... }
```

### Gaps found, each with a small fix

1. **Type text is the checker's, not the author's.** `Responsive<GutterNumbers>` prints as
   `Partial<Record<ResponsiveKey, GutterNumbers>>`, `ButtonVariant` as `keyof BaseButtonVariant`,
   `Size` as `keyof BaseSize`, `ClassValue` as `any`. Fix: use the declared type node
   (`getDeclarations()` → source range → `PropertySignature.type`). This is also what makes linking
   possible (section 2).
2. **Event JSDoc is dropped** for tuple-style emits (`ok: [value: BvTriggerableEvent]`): Vue turns them
   into call signatures without docs. Verified fix: read the member doc off the emits interface
   (`checker.getPropertyOfType(BModalEmits, 'ok').getDocumentationComment()` returns it).
3. **Template-literal slots are missing** (`cell(${string})`, `head(...)`, `foot(...)` on BTable).
   Verified fix: `checker.getIndexInfosOfType(BTableSlots)` returns all three with scope types; render
   as `cell({key})` like today.
4. **`useDefaults` (global config defaults) is invisible.** Correct behaviour: docs show the
   component default; a note on the page explains BApp overrides.
5. **Pass-through defaults.** BAlert declares `activeClass: undefined` and lets BLink default it; the
   docs show BLink's `'router-link-active'`. Source is technically right, but less useful. Needs a
   `@defaultValue` override or the existing "linked section" concept.

## 2. Type linking

Prototype: [`links.cjs`](./docs-from-source-prototype/links.cjs). It builds a **symbol table of every
type exported from `src/types/index.ts`** (389 types, ~0.5 s), then walks each prop's declared type
node and resolves each `TypeReference` identifier with the checker, following import aliases:

```
BRowProps.gutterX:     [Responsive](#Responsive)<[GutterNumbers](#GutterNumbers)>
BModalProps.okVariant: [ButtonVariant](#ButtonVariant) | null
BModalProps.size:      [Size](#Size) | 'xl'
BTableProps.tbodyTrClass: ((item: {Item} | null, type: [TableRowType](#TableRowType)) => [TableStrictClassValue](#TableStrictClassValue)) | [TableStrictClassValue](#TableStrictClassValue)
BModalProps.teleportTo: {TeleportProps → @vue/runtime-core}['to']
```

**Is following the full import tree a problem?** No, when bounded by the right rule:

- From all `B*Props`/`B*Slots`/`B*Emits`, **435 local types are reachable, max depth 5**, total
  definition text ~77 KB. One flat, de-duplicated table covers all of it; cycles are handled by a
  `seen` set (the BFS terminated instantly).
- **Bound: link only to types declared in this package; stop at `node_modules` and `lib.*.d.ts`.**
  There are 38 external leaves (`Partial`, `Record`, `Omit`, `MouseEvent`, `HTMLElement`,
  `ComponentPublicInstance`, `RouteLocationRaw`, `TeleportProps`, floating-ui `Middleware`, …). Render
  them as plain text, or map a handful to MDN / Vue / vue-router URLs. This is what keeps huge unions
  (`HTMLAttributes`, `AriaAttributes`) out.
- **Never expand types; show the definition as written.** The popover for `GutterNumbers` is its
  source (`export type GutterNumbers = | 0 | 1 | … | '12'`) plus its JSDoc, itself linkified. Expansion
  is what blows up (and what produced `Partial<Record<...>>` above).
- **27 reachable types are not exported from the barrel** (e.g. `BvTriggerableEvent`, `AttrsValue`,
  `TeleporterProps`, `ClassValue`, `Numberish`, `CommonInputProps`). They still resolve; decide per type
  whether to export it (it is public API in practice) or show it inline without an anchor. The
  generator can list these as warnings, which is a useful API-surface check on its own.
- Generic parameters (`Item`) resolve to a type parameter and render unlinked.

Rendering: one generated `types` page (or a per-type JSON) with anchors, and a `<TypeRef>` component in
the reference table that shows a popover with the highlighted definition. Shiki (already in VitePress)
can highlight definitions at build time; `@shikijs/vitepress-twoslash` is an alternative for hovers
inside code examples, but not for the API tables.

Sample of what a generated entry would look like:

```json
{
  "BRow": {
    "props": {
      "gutterX": {
        "type": [{ "ref": "Responsive" }, "<", { "ref": "GutterNumbers" }, ">"],
        "default": "undefined",
        "description": "Horizontal gutter, 0 to 12 on the spacing scale (`{ xs: 3, md: 5 }` renders `gx-3 md:gx-5`).",
        "tags": { "example": ["<BRow :gutter-x=\"{ xs: 3, md: 5 }\" />"], "since": ["0.40.0"] },
        "source": "src/types/ComponentProps.ts#L1642"
      }
    }
  },
  "$types": {
    "Responsive": {
      "file": "src/types/BreakpointProps.ts",
      "doc": "A per-breakpoint value, for example `{xs: 12, md: 6, '2xl': 4}`.",
      "definition": ["export type Responsive<T> = Partial<Record<", { "ref": "ResponsiveKey" }, ", T>>"]
    },
    "GutterNumbers": { "file": "src/types/BreakpointProps.ts", "definition": ["export type GutterNumbers = | 0 | 1 | … | '12'"] }
  }
}
```

In the table: `gutterX` · <code><u>Responsive</u>&lt;<u>GutterNumbers</u>&gt;</code> · `undefined` ·
description. Hovering `Responsive` shows its JSDoc and definition, in which `ResponsiveKey` is again a
link.

## 3. VitePress integration

Measured: checker creation + first component **~1.5 s** (program build), the whole library
(108 components) **~2.3 s**, warm component **4–120 ms**, re-extract after editing
`ComponentProps.ts` via `checker.updateFile()` **~60 ms**. Heap ~420 MB (the docs build already runs with
`--max-old-space-size=4096`).

Constraint found in VitePress 2.0.0-alpha.17 (`staticDataPlugin`): each `*.data.ts` loader is bundled
**separately** with `loadConfigFromFile`. A checker cached in a shared local module would be created
once per loader (49×). Only state in an externalised `node_modules` package or on `globalThis` is shared.
Loader output is also inlined into the importing page as JSON, so one global loader with all components
would ship everything to every page.

Options:

| | Dev start | HMR on source edit | Complexity |
| --- | --- | --- | --- |
| **A. Vite plugin in `.vitepress/plugins/`** with one checker, serving `virtual:component-api/BRow` (or `BRow.vue?api`, which is the maintainer's `?raw` idea done properly) | +~1.5 s on first API page | ✅ `hotUpdate` → `checker.updateFile` → invalidate modules whose `getDeclarations()` files changed | ~150 lines |
| B. Keep the 49 `*.data.ts` loaders, each calling a generator with a `globalThis` cached checker, `watch: ['../../../../packages/bootstrap-vue-next/src/**']` | similar | ✅ but every matching loader reruns on any edit | small, but fights the loader model |
| C. Pre-build script writing JSON (`apps/docs/src/generated/api/*.json`, gitignored), wired into turbo with the package's `src/**` as inputs, `--watch` for dev | 0 in the docs process | ✅ via watch → JSON → Vite HMR | small; turbo caches it in CI |

`?raw` + compile-time transform: importing `BRow.vue?raw` gives source text that still needs the TS
program to resolve `BRowProps` in another file, so it ends up as option A anyway. Use a custom query
or virtual id so Vite does not also compile the `.vue`.

**Recommendation: C for phase 0/1** (the diff tool needs a CLI anyway, it keeps TypeScript out of the
docs dev server, and turbo caching makes CI free on docs-only changes), **move to A** only if the
watch round-trip feels slow. Cache key for C: hash of `packages/bootstrap-vue-next/src/**/*.{ts,vue}` +
generator version (turbo `inputs` does this).

Tooling risk: `typescript@latest` now resolves to **7.0.2** (the native port). Everything here ran on
**6.0.3** (the repo's version). I did not test vue-component-meta on 7.x; pin the generator's
TypeScript to 6.x until Volar supports the new API.

## 4. What the data files carry that source can't

| Today | Keep it via |
| --- | --- |
| Descriptions | JSDoc on the props/slots/emits interface members |
| Per-component wording of a shared prop (36 `buildCommonProps({...})` overrides; e.g. `theme` default `'info'` on BAlert) | Default comes from `withDefaults` automatically. Wording: a JSDoc on the shared interface, and an override file entry only where it really differs |
| Examples | `@example` (verified extracted) |
| Cross-links to docs pages (37 descriptions) | Markdown links work inside JSDoc text (`[see](/docs/...)`); `{@link BLinkProps}` for type links |
| Deprecation | `@deprecated` (verified; also shows strikethrough in the editor, a bonus) |
| "since" | `@since` (verified) |
| Linked sections (`_opts.linkTo`, e.g. "BLink props" under BAlert), 15 uses | Derive from `extends`: props whose declaration lives on `BLinkProps` get grouped and linked to BLink automatically |
| `styleSpec` (56), `sourcePath`, section ordering | Not type information. Keep a thin per-component override file (`apps/docs/src/data/components/overrides/*.ts`) or a custom tag on the props interface (`@styleSpec bootstrap-class .row`) |
| Defaults that aren't plain values (114 TODOs) | Solved: vue-component-meta returns source text (`[]`, `Number.POSITIVE_INFINITY`) |
| Pass-through defaults (BAlert → BLink) | `@defaultValue` tag, or show "inherits from BLink" for linked-section props whose source default is `undefined` |

Shape of the override file: same keys as today, everything optional, merged over the generated data;
the generator warns when an override duplicates what source already says.

## 5. Migration cost

Generate-and-diff prototype ([`diff.cjs`](./docs-from-source-prototype/diff.cjs), raw output in
[`diff-output.txt`](./docs-from-source-prototype/diff-output.txt)), all 108 documented components:

| | Count | Notes |
| --- | --- | --- |
| Props matching by name | 1,721 | |
| Props in docs but not in source | 58 | e.g. `BFormTags.bg/fg/id/tag`, `BAvatar.icon`, `routerTag` on components that `Omit` it: stale docs |
| Props in source but not in docs | 87 | e.g. most link props on `BButton`: undocumented |
| Type differs (after normalising whitespace/`undefined`/union order) | 137 | many are real (`readonly` arrays, `Size \| string` vs `LiteralUnion<keyof BaseSize, Numberish>`) |
| Default differs | 310 | noisy (string vs value, pass-through), but includes real drift like `BAccordionItem.show` (docs `false`, source `undefined`) |
| Events in source, not docs | 47 | mostly `update:modelValue` |
| Slots in source, not docs | 4 | `BFormTags#tag`, `BTab#default/title`, … |

The prototype's normalisation is rough, so treat these as an order of magnitude, not a list to fix
blindly. The point: the hand-maintained data has drifted, and a diff tool finds it in 2 seconds.

**Moving descriptions into JSDoc by script: yes, mostly.** A ts-morph codemod can insert JSDoc on each
interface member from the data entry for the component that declares it. Where several components
inherit the same declaration (`ShowHideProps`, `BLinkProps`, `ColorExtendables`, `TeleporterProps`) with
different wording, the script picks the declaring component's text (or the most common one) and writes
the rest to the override file for review. Template-literal descriptions (13) and those composed from
helpers (`responsiveNote`) need hand work.

### Phased path

1. **Phase 0: diff tool (2–3 days).** `apps/docs/scripts/component-api.ts`: vue-component-meta +
   declared-type text + emits/slot fixes, writes JSON, plus `--diff` against the current data files.
   Fix real drift in the data files. Useful even if you stop here; can run in CI as a warning.
2. **Phase 1: render from generated data, keep the data files as overrides (3–5 days).**
   `ComponentReference.vue` merges generated + data file; the data files lose `type`/`default`
   (generated), keep descriptions for now. Add the `$types` table, a types page and `<TypeRef>`
   popovers.
3. **Phase 2: move descriptions into JSDoc (4–6 days incl. review).** Codemod, then review the shared
   prop wording. Data files shrink to `styleSpec` and the occasional override. Editors now show the
   docs on hover for consumers too (the descriptions ship in the `.d.ts`).
4. **Phase 3 (optional): lint.** Fail the generator on public props without JSDoc, overrides that
   duplicate source, or reachable types not exported from `types/index.ts`.

Total ≈ 2–3 weeks part-time; phase 2 review is the uncertain part.

## 6. Build vs reuse

- **Reuse vue-component-meta** for extraction; it handles `withDefaults`, `defineModel`, generics,
  `Omit`/`extends` and slot scopes correctly, and the Vue team maintains it alongside vue-tsc.
- **Build a small in-repo layer** for: declared-type text, type linking + symbol table, emits JSDoc,
  template-literal slots, linked-section grouping, override merge. ~400–600 lines, in
  `apps/docs/scripts/` (or a private workspace package if option A's shared-checker needs it).
- **Don't publish a package now.** The rules that matter (barrel = linkable surface, linked sections
  from `extends`, BVN's override shape) are specific to this repo. Revisit if the Nuxt module or another
  library wants the same output.

## Risks

- **Description review burden** is the main cost and the main source of churn in the library's
  `types/*.ts` files (the v6 migration is touching the same files; do phase 2 after the big v6 type
  changes settle, or expect merge conflicts).
- Library `.d.ts` grows with JSDoc. That is a feature (editor hovers), but it is a public-surface change
  reviewers will see in every PR touching types.
- vue-component-meta is pre-1.0 in spirit (APIs like `rawType` deprecated in 3.x); pin it and keep the
  wrapper thin. TypeScript 7 support unknown.
- Generation adds ~420 MB heap and ~2 s to whichever process runs it.
- Some docs value is editorial (wording tailored per component, pass-through defaults). Over-automating
  could make the reference less helpful; the override file is the escape hatch.

## When to leave it as is

If the docs reference is rarely wrong in practice and nobody plans to write JSDoc for editor hovers,
phase 0 alone (diff in CI) gets most of the correctness value for 2–3 days, without touching the
library types.
