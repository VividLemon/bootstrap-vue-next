# Bootstrap v6 New Components Plan

## Purpose

This is the plan and orchestrator handoff for the second part of the Bootstrap 6 migration: the components Bootstrap marks "New" in v6.
It maps each v6 component to its BootstrapVueNext counterpart (or marks it as new), lists composable candidates, splits the research into parallel groups, and tells the orchestrating agent how to run the research and route questions to the maintainer.

Work here is **research and decisions first**. Implementation waits until the maintainer has answered each group's questions and the foundations PR ([#164](https://github.com/VividLemon/bootstrap-vue-next/pull/164)) has settled.

## Maintainer rules (authoritative)

1. **New v6 components supersede the existing library standards.** A counterpart is redesigned to Bootstrap's API, markup and behavior. Existing library props survive only when they are a small additive on top of Bootstrap's behavior (a handful of props that change a couple of behaviors). Everything else is removed. Example: `BModal` is slimmed down to Bootstrap's Dialog API.
2. **`reka-ui`-based components are totally replaced** by their Bootstrap version, props and all — no carried-over API:
   - `BAutocomplete` → Combobox
   - `BFormOtp` → OTP input
   - `BDatePicker`, `BDateRangePicker`, `BDateField`, `BDateRangeField`, `BTimeField`, `BTimeRangeField` → Datepicker
   - After these, `reka-ui` should no longer be needed as a dependency (`packages/bootstrap-vue-next/package.json` lists it as a peer and dev dependency); confirm during research.
3. **Skip v6 features that duplicate what Vue already does.** Toggler is excluded: toggling a class or attribute on an element is native Vue reactivity. Judge every other new component on its own merits; most are not like Toggler.
4. Breaking changes are expected. No compatibility aliases or shims.
5. The cross-cutting conventions from the first part still apply (see `BOOTSTRAP_V6_MIGRATION.md`): CSS `@layer components`, `2xl` breakpoints and prefix classes, object-only `Responsive<T>` / `HoverState<T>` props, `<part>Color` objects, `*Attrs` replacing `*Class`, native CSS transitions with `noTransition`.

## Component map

### Redesign: v6 component superseding an existing counterpart

Approach "Redesign" = rebuild to Bootstrap's API, keeping only small additive props (rule 1). "Replace" = remove the old component entirely and build Bootstrap's version (rule 2).

| v6 component | v6 JS                                  | Existing counterpart(s)                                                                                                                                            | Approach                                                                                               | Shares with                    |
| ------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------ |
| Dialog       | `dialog.ts` on `dialog-base.ts`        | `BModal`, `useModal`, `vBModal`, `useModalManager`, orchestrator in `BApp`                                                                                         | Redesign                                                                                               | Drawer                         |
| Drawer       | `drawer.ts` on `dialog-base.ts`        | `BOffcanvas`                                                                                                                                                       | Redesign                                                                                               | Dialog, Navbar                 |
| Menu         | `menu.ts`                              | `BDropdown`, `BNavItemDropdown`, `BDropdownItem`, `BDropdownItemButton`, `BDropdownForm`, `BDropdownGroup`, `BDropdownHeader`, `BDropdownDivider`, `BDropdownText` | Redesign                                                                                               | Combobox, Nav overflow, Navbar |
| Navbar       | — (uses Collapse, Drawer)              | `BNavbar`, `BNavbarBrand`, `BNavbarNav`, `BNavbarToggle`                                                                                                           | Redesign                                                                                               | Drawer, Menu                   |
| Accordion    | — (uses Collapse)                      | `BAccordion`, `BAccordionItem`                                                                                                                                     | Redesign                                                                                               | Collapse (native since #164)   |
| Avatar       | —                                      | `BAvatar`, `BAvatarGroup`                                                                                                                                          | Redesign                                                                                               | Badge                          |
| Carousel     | `carousel.ts`                          | `BCarousel`, `BCarouselSlide`                                                                                                                                      | Redesign                                                                                               | —                              |
| Chips        | `chips.ts`                             | `BFormTags`, `BFormTag`                                                                                                                                            | Redesign                                                                                               | Field                          |
| Scrollspy    | `scrollspy.ts` (IntersectionObserver)  | `vBScrollspy`, `useScrollspy`                                                                                                                                      | Redesign                                                                                               | —                              |
| Range        | `range.ts`                             | `BFormInput type="range"`                                                                                                                                          | Redesign (new component or `BFormInput` feature — research decides)                                    | Field                          |
| Field        | — (CSS)                                | `BFormGroup` (renders `.form-field` since #165)                                                                                                                    | Redesign (`BFormGroup` becomes Field, or a new component — research decides)                           | All form controls              |
| Combobox     | `combobox.ts` (uses Menu)              | `BAutocomplete` (reka-ui)                                                                                                                                          | **Replace**                                                                                            | Menu                           |
| OTP input    | `otp-input.ts`                         | `BFormOtp` (reka-ui)                                                                                                                                               | **Replace**                                                                                            | Field                          |
| Datepicker   | `datepicker.ts` (vanilla-calendar-pro) | `BDatePicker`, `BDateRangePicker`, `BDateField`, `BDateRangeField`, `BTimeField`, `BTimeRangeField` (reka-ui)                                                      | **Replace** (research: v6 has no time-only picker — decide what replaces the time fields, if anything) | Menu / Popover                 |

### Totally new: no counterpart

| v6 addition       | Kind                                   | Notes                                                                |
| ----------------- | -------------------------------------- | -------------------------------------------------------------------- |
| Password strength | JS `strength.ts` + CSS                 | `minLength`, custom `scorer`                                         |
| Nav overflow      | JS `nav-overflow.ts` (uses Menu) + CSS | Moves overflowing nav items into a menu; component or `BNav` feature |
| Stepper           | CSS only                               | Check v6 markup for state and a11y                                   |
| Form adorn        | CSS only                               | Adornments inside a control; component or `BInputGroup`-style slots  |
| Prose             | CSS only                               | `.prose` typography for rich content; wrapper component or docs only |
| CSS Grid          | CSS only (`.grid`, `g-col-*`)          | `BGrid` / `BGridItem`; responsive via container queries              |

### Excluded

| v6 addition                                                                                                             | Why                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Toggler (`toggler.ts`)                                                                                                  | Duplicates native Vue class/attribute binding (rule 3)                                                                          |
| CSS-only helpers and utilities — Hover lift, Theme and Color scheme utilities, Container queries, Motion, Space, Divide | Usable directly as classes; mention in the docs. Research may propose exposing one as a prop where a component clearly benefits |

### Composable candidates

Public, non-UI composables that could come with a component, for new and existing components alike. Research decides whether each is worth a public API.

| Composable                              | Related component                       | Notes                                                                                                                          |
| --------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `useModal` (redesign)                   | Dialog                                  | Resolve with `{ trigger, ok, value? }` aligned with native `cancel` / `close` / `returnValue`, instead of `BvTriggerableEvent` |
| `useDrawer` or shared dialog controller | Drawer                                  | Only if Dialog's controller pattern should cover drawers too                                                                   |
| `useScrollspy` (rebuild)                | Scrollspy                               | IntersectionObserver + `topMargin`, as v6                                                                                      |
| `usePasswordStrength`                   | Password strength                       | Scoring usable without the component                                                                                           |
| `useNavOverflow`                        | Nav overflow                            | Overflow measuring usable without the component                                                                                |
| `useCombobox` / filtering helper        | Combobox                                | Only if filtering or option state is useful on its own                                                                         |
| `useDatepicker` / date helpers          | Datepicker                              | Parsing, formatting and range state, if not covered by vanilla-calendar-pro                                                    |
| `useCarousel`                           | Carousel                                | Programmatic slide control, if the component API isn't enough                                                                  |
| `useToast` (review)                     | Toast (existing)                        | Align with the native transition path from #167                                                                                |
| container-query helpers                 | CSS Grid, Navbar, responsive components | v6 responsive classes react to query containers, not the viewport                                                              |

## Required context for every agent

1. `AGENTS.md` — library rules (SSR safety, public API, docs data files, checks).
2. [`architecture/BOOTSTRAP_V6_MIGRATION.md`](./BOOTSTRAP_V6_MIGRATION.md) — the first part's decisions, conventions, required checks and batch agent instructions. Its **Deferred components** section lists what was already changed on each counterpart ("Now") and what is pending.
3. The open PRs on `VividLemon/bootstrap-vue-next`. Read each description and the review comments, because review can change a convention:

   | PR                                                                            | Why it matters                                                                                                                                                                                                                                                                            |
   | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | [#164](https://github.com/VividLemon/bootstrap-vue-next/pull/164) foundations | **Read first and most closely.** The APIs every new component builds on: `src/composables/useShowHide.ts`, `useLegacyShowHide.ts`, `useCssTransition.ts`, `src/utils/responsive.ts`, `resolvePartColor` in `useThemeClasses.ts`, `types/HoverState.ts`, `architecture/ARIA_VISIBILITY.md` |
   | [#165](https://github.com/VividLemon/bootstrap-vue-next/pull/165) forms       | `.form-field`, `validate`, v6 check markup — the base for Field, Range, Chips, OTP input, Combobox, Datepicker                                                                                                                                                                            |
   | [#166](https://github.com/VividLemon/bootstrap-vue-next/pull/166) tables      | Function-valued `*Attrs`, native stacked tables                                                                                                                                                                                                                                           |
   | [#167](https://github.com/VividLemon/bootstrap-vue-next/pull/167) feedback    | Reference migrations onto the native transition path (`BAlert` `.hiding`, `BToast` `.show`)                                                                                                                                                                                               |
   | [#168](https://github.com/VividLemon/bootstrap-vue-next/pull/168) navigation  | State-specific `*Attrs`, tab panes on v6 `.active` fades                                                                                                                                                                                                                                  |

   ```bash
   gh pr view 164 --repo VividLemon/bootstrap-vue-next --comments
   gh pr diff 164 --repo VividLemon/bootstrap-vue-next
   ```

4. Bootstrap 6 sources (authoritative): `packages/bootstrap-vue-next/node_modules/bootstrap/dist/css/bootstrap.css`, `scss/`, `js/src/`, and https://getbootstrap.com/docs/6.0/ (compare with /docs/5.3/).

## Research groups

Each group runs as one read-only research subagent. Components sharing a v6 base stay together so the shared design is decided once.

| Group                  | Scope                                                                     | Depends on                                                                   | Output                                     | State       |
| ---------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------ | ----------- |
| G1 Overlays            | Dialog, Drawer, `useModal` redesign                                       | #164 transition core                                                         | `architecture/BOOTSTRAP_V6_OVERLAYS.md`    | In research |
| G2 Menus               | Menu, Combobox, Nav overflow                                              | #164; Menu is the base for the other two                                     | `architecture/BOOTSTRAP_V6_MENUS.md`       | In research |
| G3 Navbar              | Navbar                                                                    | References G1 (Drawer) and G2 (Menu) decisions; research can run in parallel | `architecture/BOOTSTRAP_V6_NAVBAR.md`      | Questions open |
| G4 Form inputs         | Field, Range, Chips, OTP input, Datepicker, Password strength, Form adorn | #165 forms                                                                   | `architecture/BOOTSTRAP_V6_FORM_INPUTS.md` | In research |
| G5 Display             | Accordion, Avatar, Carousel, Stepper, Prose                               | #164 (Collapse), #167 (Badge)                                                | `architecture/BOOTSTRAP_V6_DISPLAY.md`     | In research |
| G6 Layout and behavior | Scrollspy, CSS Grid, container-query helpers                              | #164 (breakpoints, responsive)                                               | `architecture/BOOTSTRAP_V6_LAYOUT.md`      | In research |

## Orchestrator handoff

You are the orchestrating agent for the research phase. You coordinate; the research subagents read and write their group documents; the maintainer decides.

1. **Set up.**
   - Work on branch `bootstrap-v6-new-components-plan` (stacked on `bootstrap-v6-foundations`). Agent worktrees in this project have repeatedly been created from `main`: check `git merge-base --is-ancestor 72c72e52 HEAD` and reset to `bootstrap-v6-new-components-plan` if it fails and nothing is committed.
   - Read this document, the required context above, and the "Batch agent instructions" and "Required checks" in `BOOTSTRAP_V6_MIGRATION.md`.
2. **Launch the research subagents in parallel**, one per group (G1–G6), each read-only on code. Give each one: the maintainer rules, the component map rows for its group, the required context list, and its output file. Each subagent must:
   - compare the v6 docs, CSS and JS with v5 and with the current library component (template, props, slots, emits, composables, specs, docs)
   - apply the maintainer rules: decide redesign vs. replace per the map, list every existing prop as **keep (small additive)**, **replace with v6 equivalent** or **remove**
   - propose the public API (props, slots, emits, exposed methods), the markup, the a11y behavior, SSR concerns, and any composable from the candidates table
   - write its document with a **Questions for the maintainer** section: each question with the options, pros and cons, and a recommendation
   - not edit code, this plan or `BOOTSTRAP_V6_MIGRATION.md`
   - return the document path and the list of questions
     If the usage limit stops a subagent, resume the same agent (its context and files are kept) rather than starting over.
3. **Funnel questions to the maintainer.** Subagents cannot talk to the maintainer; you can.
   - Collect every group's questions, merge duplicates and cross-group questions (e.g. Dialog and Drawer sharing a controller, Menu decisions that Combobox and Navbar inherit).
   - Ask in batches, highest-impact first, each with options and your recommendation. Use the question tool for short multiple-choice batches; write longer comparisons into the group document and point to it.
   - Record every answer in the group document's decisions section as soon as it is given.
4. **Keep everything durable.** Commit each group document on `bootstrap-v6-new-components-plan` as it lands, update the Research groups table above, and push so the PR stays current. Session scratchpads have been wiped before; nothing important may live only there.
5. **Hand off to implementation** once a group's questions are answered and #164 has settled: implement per group in worktrees with stacked PRs, following the batch agent instructions and required checks in `BOOTSTRAP_V6_MIGRATION.md`. Fold the decisions into that plan's Deferred components section as each group lands.

## Practical notes

- Branch names must not reuse existing remote branches (`bootstrap-v6`, `bootstrap-v6-foundations`, `-forms`, `-tables`, `-feedback`, `-navigation`, `-new-components-plan`).
- `apps/docs`: use `pnpm --filter docs run type-check`; a plain `vue-tsc --noEmit` there checks nothing.
- Earlier experimental v6 branches were deleted from `origin` on 2026-11-03 because they were stale and not wanted. Their last commits are kept locally under `refs/archive/<branch>` and can be restored with `git push origin <sha>:refs/heads/<branch>`:

  | Branch                                                    | Last commit |
  | --------------------------------------------------------- | ----------- |
  | `bootstrap-v6-alert-show-hide-composable`                 | `a6a097d9`  |
  | `bootstrap-v6-avatar`                                     | `7ff01397`  |
  | `bootstrap-v6-baccordion`                                 | `e2c91c54`  |
  | `bootstrap-v6-badge`                                      | `0eca653d`  |
  | `bootstrap-v6-otp`                                        | `bdbd7fd3`  |
  | `bootstrap-v6-time-components`                            | `b6b763df`  |
  | `copilot/refactor-btabs-to-use-reka-ui` (PR #153, closed) | `89428ff5`  |

  The merged branches `bootstrap-v6-aspect`, `-breadcrumb`, `-card`, `-color-themes` and `-color-themes-patch-1` were deleted too; their work is in `bootstrap-v6`.
