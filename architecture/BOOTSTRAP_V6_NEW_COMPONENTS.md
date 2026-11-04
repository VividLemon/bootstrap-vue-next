# Bootstrap v6 New Components Plan

## Purpose

This is the briefing and inventory for the second part of the Bootstrap 6 migration: the components Bootstrap marks "New" in v6.
It lists what has to be redesigned (a BootstrapVueNext counterpart exists), what has to be added (no counterpart), which non-UI composables are candidates, and how the research is split so independent groups can run in parallel.

These components were deferred from the first part because aligning them with Bootstrap's new standards needs many breaking-change decisions from the maintainer.
Work here is **research and decisions first**; implementation waits until the maintainer has answered each group's decisions and the foundations PR has settled.

## Required context (read before starting)

1. `AGENTS.md` — library rules (SSR safety, public API, docs data files, checks).
2. [`architecture/BOOTSTRAP_V6_MIGRATION.md`](./BOOTSTRAP_V6_MIGRATION.md) — the first part's decisions and conventions. In particular:
   - cross-cutting rules: CSS `@layer components`, `2xl` breakpoints and prefix classes, object-only `Responsive<T>` / `HoverState<T>` props, `<part>Color` objects, `*Attrs` replacing `*Class`, native transitions with `noTransition`
   - the **Deferred components** section, which lists for each counterpart what was already changed ("Now") and what is pending
3. The open PRs on `VividLemon/bootstrap-vue-next`. Read each description, then the review comments, because review can change a convention:

   | PR                                                                            | Why it matters                                                                                                                                                                                                                                                                                              |
   | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | [#164](https://github.com/VividLemon/bootstrap-vue-next/pull/164) foundations | **Read first and most closely.** The APIs every new component builds on: `src/composables/useShowHide.ts` (native core), `useLegacyShowHide.ts`, `useCssTransition.ts`, `src/utils/responsive.ts`, `resolvePartColor` in `useThemeClasses.ts`, `types/HoverState.ts`, and `architecture/ARIA_VISIBILITY.md` |
   | [#165](https://github.com/VividLemon/bootstrap-vue-next/pull/165) forms       | `.form-field`, `validate`, v6 check markup — the base for Field, Range, Chips, OTP, Combobox, Datepicker                                                                                                                                                                                                    |
   | [#166](https://github.com/VividLemon/bootstrap-vue-next/pull/166) tables      | function-valued `*Attrs` design, native stacked tables                                                                                                                                                                                                                                                      |
   | [#167](https://github.com/VividLemon/bootstrap-vue-next/pull/167) feedback    | the reference migrations of components onto the native transition path (`BAlert` `.hiding`, `BToast` `.show`)                                                                                                                                                                                               |
   | [#168](https://github.com/VividLemon/bootstrap-vue-next/pull/168) navigation  | state-specific `*Attrs`, tab panes on v6 `.active` fades                                                                                                                                                                                                                                                    |

   ```bash
   gh pr view 164 --repo VividLemon/bootstrap-vue-next --comments
   gh pr diff 164 --repo VividLemon/bootstrap-vue-next
   ```

4. **Earlier unmerged work on `origin`.** These branches were made before the color API work (all branched from `a3ed6e5d`) and have no PR. Read the one for your component before researching, and treat it as the maintainer's earlier direction, not as finished work:

   | Branch                                    | Commit                                                                        | Scope                                               |
   | ----------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------- |
   | `bootstrap-v6-alert-show-hide-composable` | `a6a097d9` chore: alert v6                                                    | BAlert (since redone in #167 — compare, don't redo) |
   | `bootstrap-v6-badge`                      | `0eca653d` chore: bootstrap-v6-badge                                          | BBadge (since redone in #167 — compare, don't redo) |
   | `bootstrap-v6-avatar`                     | `7ff01397` chore: avatar v6                                                   | BAvatar                                             |
   | `bootstrap-v6-baccordion`                 | `e2c91c54` feat: accordion v6                                                 | BAccordion                                          |
   | `bootstrap-v6-otp`                        | `bdbd7fd3` feat(BFormOtp)!: migrate to Bootstrap 6 OTP input                  | BFormOtp                                            |
   | `bootstrap-v6-time-components`            | `b6b763df` feat!: replace date/time components with BDatepicker (Bootstrap 6) | BDatePicker, BDateField, BTimeField                 |

5. Bootstrap 6 sources (authoritative): `packages/bootstrap-vue-next/node_modules/bootstrap/dist/css/bootstrap.css`, `scss/`, `js/src/`, and https://getbootstrap.com/docs/6.0/ (compare with /docs/5.3/).

## Inventory

### A. Redesign: v6 component with a BootstrapVueNext counterpart

| v6 component | v6 JS                                  | Counterpart(s)                                                                          | Shares with                    | Notes                                                                                                    |
| ------------ | -------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Dialog       | `dialog.ts` (on `dialog-base.ts`)      | `BModal`, `useModal`, `vBModal`, `useModalManager`, orchestrator in `BApp`              | Drawer                         | Native `<dialog>`; `useModal` result redesign; fullscreen prefix syntax                                  |
| Drawer       | `drawer.ts` (on `dialog-base.ts`)      | `BOffcanvas`                                                                            | Dialog, Navbar                 | Native `<dialog class="drawer">`; `responsive` → `md:drawer`                                             |
| Menu         | `menu.ts`                              | `BDropdown`, `BNavItemDropdown`, `BDropdownItem*`, `BDropdownForm`, `BDropdownGroup`, … | Combobox, Nav overflow, Navbar | `.dropdown-*` → `.menu-*`                                                                                |
| Navbar       | — (uses Collapse / Drawer)             | `BNavbar`, `BNavbarBrand`, `BNavbarNav`, `BNavbarToggle`                                | Drawer, Menu, Collapse         | `toggleable` → `md:navbar-expand`; navbar is a query container                                           |
| Accordion    | — (uses Collapse)                      | `BAccordion`, `BAccordionItem`                                                          | Collapse (migrated in #164)    | Header still renders v5 `collapsed` class                                                                |
| Avatar       | —                                      | `BAvatar`, `BAvatarGroup`                                                               | Badge (#167)                   | Library `_avatar.scss` vs v6 avatar CSS                                                                  |
| Carousel     | `carousel.ts`                          | `BCarousel`, `BCarouselSlide`                                                           | —                              | Rewritten in v6: removed control/caption/dark classes, `autoplay`, `ends`                                |
| Chips        | `chips.ts`                             | `BFormTags`, `BFormTag`                                                                 | Field, Form control            | Chip input markup (`.chip-input`, `.form-ghost`)                                                         |
| Combobox     | `combobox.ts` (uses Menu)              | `BAutocomplete`                                                                         | Menu                           |                                                                                                          |
| Datepicker   | `datepicker.ts` (vanilla-calendar-pro) | `BDatePicker`, `BDateRangePicker`, `BDateField`, `BTimeField`, date/time range fields   | Menu / Popover                 | The library builds on `reka-ui` today; decide whether to keep it or wrap vanilla-calendar-pro as v6 does |
| OTP input    | `otp-input.ts`                         | `BFormOtp`                                                                              | Field                          |                                                                                                          |
| Range        | `range.ts`                             | `BFormInput type="range"`                                                               | Field, Validation              | Range validation styles in `_form-input.scss`                                                            |
| Scrollspy    | `scrollspy.ts` (IntersectionObserver)  | `vBScrollspy`, `useScrollspy`                                                           | —                              | v6 options: `topMargin`; removed `offset` / `method`                                                     |
| Field        | — (CSS)                                | `BFormGroup` (now renders `.form-field`, #165)                                          | All form controls              | Decide whether `BFormGroup` becomes the Field component or a new `BFormField` is added                   |

### B. New: no counterpart

| v6 addition       | Kind                                   | Candidate API                                              | Notes                                                                                                                |
| ----------------- | -------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Password strength | JS `strength.ts` + CSS                 | component (e.g. `BFormPasswordStrength`) and/or composable | `minLength`, custom `scorer`                                                                                         |
| Nav overflow      | JS `nav-overflow.ts` (uses Menu) + CSS | component or `BNav` prop                                   | Moves overflowing nav items into a menu                                                                              |
| Stepper           | CSS only                               | `BStepper` / `BStep`                                       | Check v6 markup for state and a11y                                                                                   |
| Toggler           | JS `toggler.ts`                        | directive and/or composable                                | Toggles a class or attribute `value` on a target; `toggle` / `toggled` events. Different from `vBToggle` (show/hide) |
| Form adorn        | CSS only                               | component or `BInputGroup`-style slots                     | Icons/adornments inside a control                                                                                    |
| Prose             | CSS only                               | wrapper component or docs only                             | `.prose` typography for rich content                                                                                 |
| CSS Grid          | CSS only (`.grid`, `g-col-*`)          | `BGrid` / `BGridItem`                                      | Deferred feature in the first plan; container-query responsive                                                       |

### C. Non-UI composable candidates

| Candidate                | Source                      | Notes                                                                                                   |
| ------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------- |
| `usePasswordStrength`    | `strength.ts` scoring       | Usable without the component                                                                            |
| `useToggler`             | `toggler.ts`                | Pair with a directive                                                                                   |
| `useNavOverflow`         | `nav-overflow.ts` measuring | Overflow detection                                                                                      |
| `useScrollspy` (rebuild) | `scrollspy.ts`              | Existing composable; move to IntersectionObserver + `topMargin`                                         |
| `useModal` (redesign)    | Dialog                      | Resolve with `{ trigger, ok, value? }`                                                                  |
| container-query helpers  | v6 container queries        | v6 responsive classes react to query containers, not the viewport; decide whether a JS helper is useful |

### D. CSS-only v6 additions (no component; document or expose through props)

Helpers and utilities that need no component: Hover lift, Theme and Color scheme utilities, Container queries (`.contains-inline`), Motion (`transition-none`), Space, Divide. Decide per item whether any component should expose them as props; otherwise only mention them in the docs.

## Research groups (parallelizable)

Each group can run as its own read-only research agent. Groups sharing a v6 base are kept together so the shared design is decided once.

| Group                  | Scope                                                                                          | Depends on                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| G1 Overlays            | Dialog, Drawer, `useModal` redesign                                                            | #164 transition core                                                                                  |
| G2 Menus               | Menu, Combobox, Nav overflow                                                                   | #164; Floating UI batch of the first plan                                                             |
| G3 Navbar              | Navbar                                                                                         | G1 (Drawer) and G2 (Menu) decisions — research can run in parallel; decisions should reference theirs |
| G4 Form inputs         | Field, Range, Chips, OTP input, Datepicker (+ date/time fields), Password strength, Form adorn | #165 forms                                                                                            |
| G5 Display             | Accordion, Avatar, Carousel, Stepper, Prose                                                    | #164 (Collapse), #167 (Badge)                                                                         |
| G6 Behavior and layout | Scrollspy, Toggler, CSS Grid, container-query helpers                                          | #164 (breakpoints, responsive)                                                                        |

A session for G1 (`BModal` → Dialog) has been proposed separately; it writes `architecture/BOOTSTRAP_V6_DIALOG.md`.

## Process

1. **Research (per group, read-only).** Produce `architecture/BOOTSTRAP_V6_<GROUP>.md`: for each component the v5 → v6 markup/JS/a11y differences, the current library behavior, every decision with options, pros, cons and a recommendation, and the breaking changes. Do not change component code. Do not edit `BOOTSTRAP_V6_MIGRATION.md`.
2. **Maintainer decisions.** Each group's document is reviewed in its own PR; decisions are recorded in that document.
3. **Implementation.** After #164 settles and the group's decisions are made, implement per group in worktrees with stacked PRs, following the "Batch agent instructions" and "Required checks" in `BOOTSTRAP_V6_MIGRATION.md`. Fold the decided items back into the main plan's Deferred components section as each group lands.

## Practical notes

- Agent worktrees in this project have repeatedly been created from `main`. Before any work, check `git merge-base --is-ancestor 72c72e52 HEAD` and reset to `bootstrap-v6-foundations` (or the current base) if it fails and nothing is committed.
- Keep every result in tracked files or PR descriptions. Session scratchpads have been wiped before and research reports were lost.
- Branch names must not reuse existing remote branches (see the table above, plus `bootstrap-v6-card`, `bootstrap-v6-breadcrumb`, `bootstrap-v6-aspect`, `bootstrap-v6-color-themes*`).
- `apps/docs`: use `pnpm --filter docs run type-check`; a plain `vue-tsc --noEmit` there checks nothing.
