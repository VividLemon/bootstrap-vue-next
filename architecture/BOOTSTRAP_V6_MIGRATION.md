# Bootstrap v6 Migration Plan

## Overview

This document records the maintainer decisions for migrating BootstrapVueNext from Bootstrap 5 to Bootstrap 6 (`6.0.0-alpha.1`).
It is the single source of truth for the migration: implementation work follows it, and the deferred-component section keeps decided-but-not-yet-applied changes from being lost.

- Branch: `bootstrap-v6`
- Breaking changes are allowed and expected. Do not add backwards-compatible aliases, mappings or deprecated shims unless a section below says so.
- Verify every class and CSS variable against `packages/bootstrap-vue-next/node_modules/bootstrap/dist/css/bootstrap.css` before using it.
- Breaking-change notes for users are written into `apps/docs/src/docs/migration-data/components/*.md` (v5→v6 notes are deliberately kept together with the BootstrapVue→BootstrapVueNext notes for now; they will be split out later by comparing the git history).

## Status

| Phase                                                                                                              | State                                                                 |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Color API (`theme` / `bg` / `fg` / `border`, `ThemeProp`)                                                          | Done (`641959ec`)                                                     |
| Phase 0: workspace on Bootstrap 6, library SCSS on v6 Sass                                                         | Done (`80574a2c`)                                                     |
| Phase 2a: foundations (CSS layer, breakpoints + responsive objects + grid, transition core, color + hover objects) | Done (`6e762b88`…`ee04af38`)                                          |
| Phase 2b: component batches                                                                                        | In progress — see [Implementation progress](#implementation-progress) |
| Phase 3: migration docs                                                                                            | Not started                                                           |
| Deferred components                                                                                                | See [Deferred components](#deferred-components)                       |
| Post-migration: API docs generated from source                                                                     | Not started — see [Post-migration](#post-migration-api-docs-generated-from-source) |

## Implementation progress

Last updated: 2026-11-03. `bootstrap-v6` is local and not pushed.

### Phase 2b batches

Review happens through stacked PRs on `origin`: the foundations (everything on `bootstrap-v6` up to the batches) are in [#164](https://github.com/VividLemon/bootstrap-vue-next/pull/164) (`bootstrap-v6-foundations` → `bootstrap-v6`), and each batch PR targets `bootstrap-v6-foundations`. After #164 merges, retarget each batch PR to `bootstrap-v6`. Wave 2 branch names must avoid existing remote branches such as `bootstrap-v6-card` and `bootstrap-v6-breadcrumb`.

Each batch runs as an agent in its own git worktree under `.claude/worktrees/agent-<id>/` on branch `worktree-agent-<id>`, branched from `9380edda`. Uncommitted work stays in the worktree if the agent stops; check with `git -C .claude/worktrees/agent-<id> status`.

| Wave | Batch                                                | Plan section        | Branch                    | State                                                                                                                                                                                                             |
| ---- | ---------------------------------------------------- | ------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Forms and checks                                     | Forms               | `bootstrap-v6-forms`      | Done in `d4017e98`, `37133c92`, `623a742c`, `b7b89b11`, `7f1875a8`, `95100f61`, all checks pass; in review as [#165](https://github.com/VividLemon/bootstrap-vue-next/pull/165) (into `bootstrap-v6-foundations`) |
| 1    | Tables                                               | Content             | `bootstrap-v6-tables`     | Done in `d37aec0f`, all checks pass; in review as [#166](https://github.com/VividLemon/bootstrap-vue-next/pull/166) (into `bootstrap-v6-foundations`)                                                             |
| 1    | Feedback (alert, toast, spinner, badge, placeholder) | Feedback            | `bootstrap-v6-feedback`   | Done in `6b596223`, `01431c7a`, `0ceaf2f3`, `ecd1bcee`, all checks pass; in review as [#167](https://github.com/VividLemon/bootstrap-vue-next/pull/167) (into `bootstrap-v6-foundations`)                         |
| 1    | Navigation (nav, tabs, list group, pagination)       | Navigation          | `bootstrap-v6-navigation` | Done in `434ab6ac`, `c5d79b3a`, `e148bdfa`, all checks pass; in review as [#168](https://github.com/VividLemon/bootstrap-vue-next/pull/168) (into `bootstrap-v6-foundations`)                                     |
| 2    | Buttons                                              | Buttons             | —                         | Not started                                                                                                                                                                                                       |
| 2    | Floating UI (popover, tooltip)                       | Floating UI         | —                         | Not started                                                                                                                                                                                                       |
| 2    | Breadcrumb and card                                  | Breadcrumb and Card | —                         | Not started                                                                                                                                                                                                       |

Known merge overlap: the navigation batch changed `BNavForm` (`formClass` → `formAttrs`, `validated` left alone), and the forms batch adds `validate` to the same file; expect a small conflict there.

Tables batch follow-ups (from its report):

- Stacked tables now always render a wrapper (`table-responsive`) because v6 stacking uses container queries; breakpoints compare against the wrapper, not the viewport. Users lose the side-by-side label layout, `<th>` body cell stacking, `tfoot` stacking and `labelStacked`; single-cell rows render bold. All of this belongs in the `btable` / `btablesimple` migration notes.
- `table.md` still says stacked overrides sticky header/columns, which is no longer accurate.
- `src/styles/_breakpoints.scss` is now unused; remove it in cleanup.

Navigation batch follow-ups (from its report):

- `BTabs` `navItemAttrs` / `activeNavItemAttrs` / `inactiveNavItemAttrs` target the `.nav-link` button, as the old `*NavItemClass` props did; the `<li>` is only reachable through `BTab` `titleItemAttrs`. Decide whether to rename or retarget them.
- Tab panes now toggle only `.active` (v6 fades with `@starting-style`); `fade` / `show` and the timer are gone. There are no `shown` / `hidden` tab events.
- `b-pagination-pills` stays custom CSS (v6 has no pagination pills); the docs say so.
- Not checked visually: dark mode, `NavPillCard.vue` (pills in a card header now render as normal v6 pills), fill/justified pills.

Feedback batch follow-ups (from its report):

- `BAlert` and `BToast` are on the native path; nothing renders while hidden (before, a hidden element stayed in the DOM). Migration notes: `shown` / `hidden` timing, `solid` → `translucent`, `*Class` → `*Attrs`, no `fade` / `show` / `alert-dismissible` classes.
- v6 `.alert` has no bottom margin, so consecutive alerts sit flush. Native behavior; mention it in the migration notes.
- `showOnPause` on `BAlert` / `BToast` has no effect (before or after). Decide whether to remove it.
- Expect a merge conflict in `architecture/ARIA_VISIBILITY.md` (native/legacy table) with the floating UI batch.

Forms batch follow-ups (from its report):

- Also removed: `buttonGroup` on checks (only skipped the wrapper div, which no longer exists) and `BFormCheckbox` `inputClass` → `inputAttrs`. `BFormRadio` still sends all attributes, `class` included, to the input.
- Non-stacked check/radio groups use `d-flex flex-wrap column-gap-5` because v6 has no inline check class; standalone docs examples use the same utilities. Mention in the migration notes.
- A plain switch renders `<div class="switch">` around the input; button mode wins over `switch`.
- `BFormFile`'s custom control now carries `.form-control` to pick up v6 tokens, sizes and validation borders; its `plain` mode is kept.
- `BDropdownForm` gained `validate`; `formClass` on `BNavForm` / `BDropdownForm` is left to the navigation (done) and dropdown (deferred) batches.
- Not checked: dark mode, docs demos visually, input-group checkbox addon demos (`me-n2`) against the v6 `.form-field` gap.

### Resuming

1. Check each wave 1 worktree: if its branch has commits after `9380edda`, the batch finished — review and merge it. If it only has uncommitted changes, the agent stopped mid-task: resume the same agent if possible; otherwise start a new agent in that same worktree with the batch instructions below and tell it to continue from the existing changes.
2. Merge finished batches one at a time onto `bootstrap-v6` with `git cherry-pick 9380edda..<branch>` (keeps history linear), then run the checks below on the combined result.
3. Start wave 2 after wave 1 is merged, then Phase 3 (migration docs), then the cleanup section, then [Post-migration](#post-migration-api-docs-generated-from-source).
4. Update this section and the Status table after each merge.

### Required checks

- `pnpm --filter bootstrap-vue-next run test:lint`, `test:unit:ci`, `build`
- `pnpm --filter docs run type-check` — not a plain `vue-tsc --noEmit` in `apps/docs`, whose root tsconfig contains no files and checks nothing
- `cd apps/playground && npx vue-tsc --build --force`
- `npx turbo run build --force` (docs site and Nuxt) before each phase is marked done

### Batch agent instructions

Every batch agent receives these instructions plus its batch's components and plan section.

1. **Base check first.** Worktrees for this project have been created from `main` by mistake. Run `git merge-base --is-ancestor 9380edda HEAD`; if it fails and there are no commits yet, `git reset --hard bootstrap-v6`. Then `pnpm install --frozen-lockfile --ignore-scripts`.
2. **Read** `AGENTS.md`, this plan (implement exactly what it says for the batch, including the cross-cutting rules), and `architecture/ARIA_VISIBILITY.md` plus the JSDoc in `useShowHide.ts` / `useCssTransition.ts` when moving a component to the native transition path. Bootstrap v6 references: `packages/bootstrap-vue-next/node_modules/bootstrap/dist/css/bootstrap.css`, `scss/`, `js/src/`, and https://getbootstrap.com/docs/6.0/. The original research reports are lost, so re-derive details from the code and v6 sources; when something wasn't anticipated, follow v6 native behavior, make the smallest correct change, and report it.
3. **Rules.** No compatibility shims. Apply the part attrs rule to every in-scope component (specs for the class merge). Update specs, docs `*.data.ts`, `apps/docs/src/utils/*.ts`, docs pages and demos, and playground usages. Do not write `migration-data` pages or edit this plan. Keep `ComponentProps.ts` edits inside the batch's interfaces, line-local. No `git commit --no-verify`.
4. **Verify** with the required checks above, plus a headless Chromium check (installed `playwright-core`) where behavior or layout changed — via the package dev server on port 5174 with a temporary `src/App.vue` (reverted before committing) or a static SSR render with v6 `bootstrap.css` and the built library CSS. Report what could not be verified.
5. **Commit** focused Conventional Commits (`!` and a `BREAKING CHANGE:` footer for API or markup changes), each ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, on the worktree branch; do not push. Final report: branch, commit SHAs, check results, every breaking change (old → new), unanticipated findings, files touched outside the batch, and what wasn't verified.

## Cross-cutting decisions

### CSS cascade layer

- Wrap all library CSS in Bootstrap's `@layer components`.
- Emit Bootstrap's full layer order statement at the top of the library CSS so load order cannot reorder the layers:
  `@layer colors, config, root, reboot, layout, content, forms, components, custom, helpers, utilities;`
- Remove `!important`s that only existed to beat Bootstrap's unlayered v5 CSS.
- Done in `6e762b88`. Kept `!important` on `.bv-d-<bp>-down-none` (must beat display utilities), `.no-transition`, and the BTable sticky-header print rules (must beat inline styles).
- Migration notes must mention:
  - Rules that tie on specificity still rely on the library CSS loading after Bootstrap's CSS.
  - Partials are now loaded with `meta.load-css`, so consumers compiling `src/styles/styles.scss` can no longer override the library's `!default` Sass variables (e.g. `$b-table-sort-icon-*`, `$b-avatar-size`) by declaring them before the import.
  - Bootstrap 6.0.0-alpha.1 leaves some rules unlayered (`:root` tokens, `.fade`, `.collapse`, `.drawer`); they beat layered library rules.

### Breakpoints

- `Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'`. `xxl` is removed with no alias.
- Responsive classes use v6 prefix syntax: `md:col-6`, `2xl:table-responsive`, `md:list-group-horizontal`.
- Breakpoint widths follow v6: sm 576, md 768, lg 1024, xl 1280, 2xl 1536.

### Responsive and state objects

- Per-breakpoint and per-state props are replaced by a single object prop. Object only, never a `T | object` union (avoids Vue prop-type inference problems).
- Keys are v6 class prefixes. `xs` means "no prefix".

```ts
type ResponsiveKey = 'xs' | Breakpoint
type Responsive<T> = Partial<Record<ResponsiveKey, T>>
type HoverState<T> = Partial<Record<'xs' | 'hover', T>>
```

```vue-html
<BCol :cols="{ xs: 12, md: 6, '2xl': 4 }" :offset="{ md: 2 }" :order="{ lg: 'first' }" />
<!-- col-12 md:col-6 2xl:col-4 md:offset-2 lg:order-first -->
<BLink :opacity="{ xs: 50, hover: 100 }" />
<!-- link-50 hover:link-100 -->
```

### Prefixed color props become objects

Every `<part>Theme` / `<part>Bg` / `<part>Fg` trio (the 19 `*ColorExtendables` interfaces in `types/ColorTypes.ts`, plus inline families such as `badge*`) becomes one `<part>Color` object prop typed as `ColorExtendables` (plus `border` where the part has a border prop). The root `theme` / `bg` / `fg` props stay flat.

```vue-html
<BCard :header-color="{ theme: 'primary', bg: 'subtle-primary', border: 'primary' }" :body-color="{ fg: '2' }" />
```

- `headerBorder` / `bodyBorder` / `footerBorder` move into the matching `<part>Color` object.
- `subtitleFg` becomes `subtitleColor: { fg }`.
- `underlineTheme` stays flat (v6 has no hover variant for it).
- `*Variant` props that select a button style (`buttonVariant`, `closeVariant`, `okVariant`, …) are styles, not colors, and stay separate.
- Applies to all components now, including deferred ones, because these props were introduced in this same major release.
- Check whether `BApp` defaults merge object props deeply or replace them, and document the behavior.

### Part attributes (`*Attrs` replaces `*Class`)

- Every configurable inner part gets a `<part>Attrs` prop; every `<part>Class` prop is removed. Users write `:header-attrs="{ class: '…' }"`.
- Tag props (`headerTag`, `bodyTag`, …) and behavior props (`closeLabel`, `closeContent`, `okTitle`, `okDisabled`, …) stay as flat props.
- Attrs are bound with `v-bind`, so `class` and `style` merge with the component's own. Specs cover the merge per part.
- State-specific class props become state-specific attrs props (`activeNavLinkClass` → `activeNavLinkAttrs`).
- Applied now to in-scope components; applied to deferred components during their own migration (see below).

### Transitions (native, no Vue `<Transition>`)

Bootstrap v6 lets CSS own all motion: JavaScript toggles a state class (`.show`, `.active`, `.hiding`), waits for the transition to end, then fires the event. `{component}-instant` opts one element out. Zero duration resolves on the next tick.

- New composable `useCssTransition(el)`: applies a class change, waits a frame, awaits `el.getAnimations()` finished; zero duration resolves next frame; a newer toggle invalidates an older wait so no stale event fires.
- `useShowHide` becomes state + v-model + cancelable `show` / `hide` and `shown` / `hidden` events only, with no class or timing logic.
- Elements stay mounted while hidden, as in v6. `lazy` / `unmountLazy` unmount only after `hidden`.
- Remove Vue `<Transition>` from in-scope components. Deferred components may keep the old internal path until their migration; delete it once nothing uses it.
- **Remove `transProps`** from the public API everywhere. Its uses map to native replacements:

| `transProps` was used for | Replacement                                                  |
| ------------------------- | ------------------------------------------------------------ |
| enter/leave hooks         | `show` / `shown` / `hide` / `hidden` events                  |
| duration, easing          | `--bs-{component}-transition-duration` / `-timing` tokens    |
| custom classes            | `--bs-{component}-transition-property` + user CSS on `.show` |
| disabling motion          | `noTransition` or the `transition-none` utility              |

- **Rename `noFade` and `noAnimation` to `noTransition`** everywhere (`ShowHideProps`, `BTabs`, `BOverlay`, `BCarousel`, `BTransition`). It adds the component's `-instant` class.
- **Remove the `collapsed` / `not-collapsed` trigger classes.**
- Done: `useCssTransition` and the split `useShowHide` (native core + `useLegacyShowHide` for components not yet migrated); `noTransition` rename; `transProps` removed; trigger classes removed; `BCollapse` migrated; `ARIA_VISIBILITY.md` rewritten.
- To adopt the native path, a component passes `{transition: () => run()}` to `useShowHide` and binds `{show: visible, '<comp>-instant': props.noTransition || instant}`. See the composable's JSDoc and `ARIA_VISIBILITY.md`.
- `BAlert`, `BToast`, `BPopover` / `BTooltip` are still on `useLegacyShowHide` and move to the native path in their batches. Delete `useLegacyShowHide` once only deferred components remain on it, or once they are migrated.
- v6 has no `collapse-instant` class: `BCollapse` `noTransition` uses the `transition-none` utility. Because 6.0.0-alpha.1 emits `.fade` and `.collapse` transitions outside any layer, `BCollapse` also sets `--bs-transition-collapse-duration: 0s` inline while instant. Remove that workaround once upstream layers those rules.
- `shown` / `hidden` now fire when the CSS transition ends; an interrupted transition never fires its `shown` / `hidden`. Migration notes must say so.
- In-scope components: `BCollapse` (+ `vBToggle`), `BAlert`, `BToast`, `BPopover` / `BTooltip`, `BTabs`. `BAccordionItem` renders `BCollapse` and changes with it.

## Component decisions (in scope)

### Grid (`BContainer`, `BRow`, `BCol`)

- `BCol`: `cols`, `offset`, `order`, `alignSelf` are `Responsive<…>` objects. Remove `sm` / `md` / `lg` / `xl` / `xxl`, `col`, all `offset*` and `order*` props. Equal-width column is `true` (`{ md: true }` → `md:col`); `'auto'` is allowed.
- `BRow`: `cols` (row-cols), `gutterX`, `gutterY`, `alignH`, `alignV`, `alignContent` are `Responsive<…>` objects. Remove `colsSm…colsXxl`. Keep `noGutters`.
- `BContainer`: `gutterX`, `gutterY` are `Responsive<…>` objects. `fluid` stays `boolean | Breakpoint` (→ `{bp}:container`).
- Rewrite `BCol`'s `.col` fallback detection so prefix classes don't add a stray `.col`.
- Types: remove `'fill'` from alignment values; row-cols `1…6 | 'auto'`; gutters `0…12` passed straight through (document the new spacing scale, no remap); include `order-0`.
- Fix `useContainerClasses` (shared with `BNavbar`). Delete unused `utils/getBreakpointProps.ts`. Update grid docs tables (breakpoints, container widths).
- CSS Grid mode (`BGrid`): deferred.

### Buttons

- `BButton`: add `xs` size (button-only size type; `form-control-xs` doesn't exist). Add `.input-group-btn` automatically inside `BInputGroup`.
- `BButtonGroup`: add `xs` size and a `divider` boolean (`.btn-group-divider`).
- Fix toolbar demos (v6 `.btn-toolbar` has its own gap).

### Forms

- `BFormSelect`: emit `.form-control` (+ `form-control-sm/lg`) instead of `.form-select`. Remove `plain`.
- Floating labels (`BFormFloatingLabel`, `BFormGroup` floating): label renders before the control; drop `d-block` on the floating label.
- Validation: remove `validated` from `BFormGroup`, `BFormCheckboxGroup`, `BFormRadioGroup`, `BDropdownForm`. Add `validate?: boolean | 'valid'` to `BForm` (and form-rendering subcomponents such as `BNavForm`), rendering `data-bs-validate` / `data-bs-validate="valid"`.
- Tooltip feedback renders `tooltip invalid-tooltip` / `tooltip valid-tooltip`.
- `BFormGroup`: root gets `.form-field` in stacked mode; horizontal mode unchanged. `labelCols`, `contentCols`, `labelAlign` are `Responsive<…>` objects; remove all `*Sm…*Xl` variants. `labelAlign` emits `md:text-end`-style classes. `labelClass` → `labelAttrs`.
- `BFormFile`: refresh custom SCSS to v6 tokens (`--bs-control-*`, radius tokens); drop v5 validation icons.
- Remove the stale `.input-group > .form-floating` overrides in `styles.scss`.
- Checks (`BFormCheckbox`, `BFormRadio`, groups, `useFormCheck`): v6 markup — `.check` / `.radio` on the input, `check-sm/lg`, switch as `<div class="switch">` with `role="switch"`, `.form-field` instead of `.form-check`. Button mode is `<label class="btn btn-check …"><input></label>`; remove the standalone wrapper `<div>`. Remove `inline` and `reverse`. `button*` colors become `buttonColor`.

### Content

- `BTableSimple`: `responsive="md"` → `md:table-responsive`; update `_table.scss` sticky selectors.
- Stacked tables adopt v6 native: `stacked` emits `table-stacked` / `{bp}:table-stacked`, cells get `data-cell`, the wrapper provides a query container. Remove the library's stacked CSS and stacked-only props (`stackedHeading`, `labelStacked`, …).
- Remove `table-b-table-default`. Fix sort-icon light/dark switching. Fix demo `TableRowStyles.vue` (`table-success`).
- Table color families become `headColor`, `headRowColor`, `footColor`, `footRowColor`, `selectionColor`. Section class props become `*Attrs`.
- `BImg`: no changes.

### Feedback

- `BAlert`: stack vertically, drop `alert-dismissible`, `ms-auto` on close buttons; dismiss uses `.hiding` then unmounts. `close*` colors → `closeColor`; `closeClass` / `alertClass` / `headerClass` / `bodyClass` → `*Attrs`.
- `BToast`: `toast-instant` when `noTransition`; `display: flex`; remove old opacity hacks in `_toast.scss`. Add `translucent` (`.toast-translucent`), remove `solid`. Same color/attrs changes as `BAlert`.
- `BSpinner`: `spinner-sm` instead of `spinner-<type>-sm`. No workaround for the upstream grow + sm bug.
- `BBadge`: fix dot indicator (`min-h-0`). Add `variant` (`subtle` | `outline`) and a `lg` size (`.badge-lg`).
- `BPlaceholder*`: add `pulse` animation. `header*` / `footer*` colors → `headerColor` / `footerColor`.
- `BProgress`: no changes.

### Navigation

- Remove `card-header-pills` from `BNav` and `BTabs` (no v6 rule; 11 spec assertions).
- `BTabs`: `noTransition` → `tab-pane-instant`. Class props become `*Attrs`.
- Vertical pills use `nav-pills-vertical`. No workaround for fill/justified pills: fixed upstream in [twbs/bootstrap#43047](https://github.com/twbs/bootstrap/pull/43047), released after alpha.1.
- `BListGroup horizontal`: `true` → `list-group-horizontal`; breakpoint → `{bp}:list-group-horizontal`. Document that breakpoint values need a query-container ancestor (e.g. `.contains-inline`). No auto-wrap.
- `BCollapse`: native transition mechanism. `BPagination`: add `theme`; class props become `*Attrs`.

### Floating UI

- `BPopover` / `BTooltip`: `noTransition` → `popover-instant` / `tooltip-instant`; remove the dead `[data-popper-placement]` SCSS line; keep the bottom header-arrow rule. Add Escape-to-dismiss and `aria-describedby` on the trigger. Fix demo `PopoverStyles.vue` (`--bs-danger`, `--bs-emphasis-color`). `titleClass` / `bodyClass` → `*Attrs`.

### Links

- `opacity` + `opacityHover`, `underlineOffset` + `underlineOffsetHover`, `underlineOpacity` + `underlineOpacityHover` collapse to `HoverState<…>` objects on `BLink` and every component that forwards link props.
- Link opacity values are `10…100` in steps of 10 (already done).

### Breadcrumb and Card

- `BCard`: `img-placement="end"` renders the image after the body; pass `bodyTheme` / body color to `BCardBody`. Add `subtle` and `translucent`. Fix demos `CardOverlayImage.vue` + `card.md` (`img-placement="overlay"`), `CardNavComponent.vue` (`tag`), `CardHorizontal.vue`.
- `BBreadcrumb`: add a `divider` slot and a `BBreadcrumbDivider` component; auto dividers get `aria-hidden`.

## Deferred components

These map to components Bootstrap marks "New" in v6 and need large structural changes. Each will be migrated in its own pass. Changes marked **now** are applied during the current migration so the API stays uniform; everything else is pending and must be done when the component is migrated.

### BModal → Dialog

- **Now:** `noFade` / `noAnimation` → `noTransition`; `transProps` removed from its props; color families → `headerColor`, `bodyColor`, `footerColor`, `headerCloseColor`, `okColor`, `cancelColor`; `--bs-modal-zindex` now comes from v6 `$zindex-levels` (`dialog`, 1040).
- **Pending:**
  - Native `<dialog>` + v6 Dialog markup and lifecycle (`.hiding`, `.dialog-instant`, `.dialog-static`), native transition path instead of `<Transition>`.
  - Part attrs: `bodyClass`, `cancelClass`, `contentClass`, `dialogClass`, `footerClass`, `headerClass`, `headerCloseClass`, `modalClass`, `okClass`, `titleClass` → `*Attrs` (merge with existing `bodyAttrs` / `headerAttrs`).
  - `fullscreen` breakpoint → `md-down:dialog-fullscreen` prefix syntax (currently emits v5-style `modal-fullscreen-2xl-down`, which has no v6 CSS).
  - `useModal` result redesign: resolve with `{ trigger, ok, value? }` instead of `BvTriggerableEvent`; align with native `cancel` / `close`, `returnValue` and `closedby`.

### BOffcanvas → Drawer

- **Now:** `noTransition`, `transProps` removed, `headerCloseColor`.
- **Done early:** the JS breakpoint widths for `responsive` now come from the shared v6 `breakpointWidths` (lg 1024, xl 1280, 2xl 1536), needed for the `Breakpoint` type change.
- **Pending:** v6 Drawer markup (native `<dialog class="drawer">`, `.hiding`, `.drawer-instant`); `responsive` must emit `md:drawer` prefix syntax; part attrs (`bodyClass`, `footerClass`, `headerClass`, `headerCloseClass` → `*Attrs`).

### BDropdown / BNavItemDropdown → Menu

- **Now:** `noTransition`, `transProps` removed, `splitColor`; `BDropdownForm` loses `validated` (forms decision); `BDropdownGroup` header colors → `headerColor`.
- **Pending:** v6 Menu markup and classes; part attrs (`menuClass`, `splitClass`, `toggleClass`, `wrapperClass` → `*Attrs`); `.dropdown-toggle-no-caret` overrides in `styles.scss`.

### BNavbar

- **Now:** `useContainerClasses` fix lands with the grid.
- **Pending:** `toggleable` breakpoint → `md:navbar-expand` prefix syntax (currently emits v5-style `navbar-expand-2xl`, which has no v6 CSS); `navbar-collapse` has no v6 CSS; v6 navbar is a container query container.

### BAccordion / BAccordionItem

- **Now:** behavior changes with `BCollapse` (native transitions); `BAccordionItem` has `noTransition` (`BAccordion` itself does not yet).
- **Pending:** the item header button still renders the v5 accordion `collapsed` class.
- **Pending:** v6 Accordion markup; part attrs (`bodyClass`, `buttonClass`, `collapseClass`, `headerClass` → merge into `bodyAttrs` / `buttonAttrs` / `headerAttrs` / `wrapperAttrs`); `initialAnimation` naming review.

### BCarousel

- **Now:** `noAnimation` → `noTransition`.
- **Pending:** v6 Carousel rewrite (removed `.carousel-control-prev/next`, `.carousel-caption`, `.carousel-dark`, `.carousel-stacked`; `data-bs-ride` → autoplay; `wrap` → `ends`); replace `<Transition>`.

### BOverlay

- **Now:** `noFade` → `noTransition`; `spinner*` colors → `spinnerColor`.
- **Pending:** replace `<Transition>` / `useFadeTransition` with the native path.

### BAvatar / BAvatarGroup

- **Now:** `badge*` colors → `badgeColor`.
- **Pending:** v6 Avatar markup and classes; library `_avatar.scss` vs v6 avatar CSS.

### BFormTags → Chips

- **Now:** `tag*` / `addButton*` colors → `tagColor` / `addButtonColor`.
- **Pending:** v6 Chips markup; part attrs (`inputClass`, `tagClass` → `*Attrs`).

### Other new-in-v6 counterparts

- `BAutocomplete` → Combobox; `BDatePicker` / `BDateRangePicker` → Datepicker (hard-coded z-index 1050 now ties with popovers); `BFormOtp` → OTP input; `vBScrollspy` → Scrollspy; `BFormInput type="range"` → Range; `BFormGroup` → Field (review once Field is adopted).
- `BApp` / `BOrchestrator`: toast container and `<Transition>` usage follow the native transition path.

### Deferred features

- CSS Grid mode (`BGrid`, `.grid` / `g-col-*`).
- Bump to the next Bootstrap prerelease to pick up upstream fixes (nav fill/justified pills; spinner grow + sm).
- A future v6 `.btn-icon` feature on `BButton` needs a new prop name: `icon` is already taken by `BLink`'s `icon-link`.

## Cleanup and verification (end of the current migration)

- Sweep library SCSS for CSS variables missing from v6 (e.g. `--bs-border-radius*`, `--bs-transition-duration`) and replace them with v6 tokens.
- Check the `RadiusElement` scale against v6: `rounded-lg` now matches the default `rounded` radius.
- Replace v5 classes left in the docs and playground (`bg-body-tertiary`, `text-body-secondary`, `text-muted`, `bg-light`, `bg-dark`, `text-bg-*`; about 72 uses across 10 files).
- Update `modal.spec.ts` tests that still use v5 values (`bodyBg: 'dark'` → `bg-dark`).
- Replace v5 infix utilities left in docs components (`text-md-right` in `ComponentReference.vue` / `SourceHeader.vue`, `text-sm-right` in `TableRowDetails.vue`) with v6 prefix classes.
- Remove `suffixPropName` in `utils/props.ts` if it still has no non-spec callers.
- Run the docs formatter (`oxfmt` via lint-staged) over files from commits made with `--no-verify` (grid foundation).
- Docs notes for visual v6 changes that need no code change (e.g. `.btn` is now `inline-flex` with a gap).
- Nuxt builds print PostCSS `Lexical error` warnings: Nuxt's CSS minifier (`postcss-calc`) doesn't understand v6's relative color syntax (`oklch(from … calc(l * .9) …)`) in Bootstrap's own CSS. Builds succeed; decide whether to document it or configure the minifier for Nuxt users.
- Spec type-checking (`vue-tsc -p tsconfig.vitest.json`) already fails in many existing specs; it is not part of the required checks.
- Final checks: library lint, unit tests and build; docs build; playground and Nuxt builds; a pass over the built CSS for classes or variables missing from v6.

## Post-migration: API docs generated from source

One of the last steps, after the migration, the deferred components and the cleanup above are done: the description move edits the same props types the migration is still changing.

Goal: the component source is the single source of truth for the API docs. Descriptions live as JSDoc on the props / slots / emits types (shown on hover in editors and shipped in the `.d.ts`), defaults come from `withDefaults`, and types come from TypeScript. The docs render that data, and every type name in a type (e.g. `Responsive` and `GutterNumbers` in `Responsive<GutterNumbers>`) links to or pops over its definition.

Decision: use **`vue-component-meta`** for extraction, plus a small in-repo layer (about 400–600 lines). No general extractor and no published package for now. Findings, measurements and prototype scripts: [DOCS_FROM_SOURCE_INVESTIGATION.md](./DOCS_FROM_SOURCE_INVESTIGATION.md).

The in-repo layer covers:

- Declared type text instead of expanded types (`Responsive<GutterNumbers>`, not `Partial<Record<…>>`).
- Event JSDoc from the emits interface (lost for the tuple-style emits this repo uses).
- BTable's pattern slots (`cell(…)`, `head(…)`, `foot(…)`) from the slots type's index signatures.
- Type linking: a table of the types exported from `src/types/index.ts`; link only types declared in this package, stop at `node_modules` and the TS lib, and show definitions as written. Flag reachable types that aren't exported.
- A thin override file for what source can't carry: `styleSpec` notes, per-component wording of shared props, pass-through defaults.

Integration: a pre-build script that writes JSON (cached by turbo, with a watch mode for the docs dev server). Move to a single Vite plugin only if dev feels slow. Pin TypeScript to 6.x for this work.

Phases (about 2–3 weeks part-time):

1. Generate-and-diff tool comparing the `.data.ts` files with source; run it in CI. Fix the drift it reports (2–3 days).
2. Render the API tables from the generated data, with type links / popovers (3–5 days).
3. Move the ~1,600 descriptions into JSDoc by script, then review the shared-prop wording; delete the `.data.ts` content that is now generated (4–6 days).
4. Optional lint rules (e.g. every public prop has JSDoc).
