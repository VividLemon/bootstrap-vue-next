# ID-Based v-models Plan

## Purpose

Some components select one or more of their children through two v-models at once: `v-model` (the child's `id`) and `v-model:index` (the child's position). Keeping the two in sync was a recurring source of bugs in v1 (for example the `BTabs` initial-selection fix for #2773, and `BAccordion`'s `sortAccordionItems` translating ids to indexes and back). This plan removes the dual pattern: every component that selects children by position gets **one** `v-model`, and it holds **ids**.

It also audits the components whose only v-model is an index, to judge whether standardizing on ids everywhere is practical. Those are **not** changed by this plan unless the maintainer decides so (see [Questions](#questions-for-the-maintainer)).

Audited on `bootstrap-v6-new-components-plan` (stacked on `bootstrap-v6-foundations`, #164), including the navigation batch (#168), which does not change any v-model.

## Rules

1. A component that selects children has exactly one selection v-model, `modelValue`, holding the child id (`string`), or ids (`string[]`) when several can be selected.
2. No `v-model:index`, no index/id sync code. Positional control stays available through exposed methods (`next()`, `prev()`, …), not through a model.
3. When a child has no explicit `id`, the component generates one (`useId`), and the model emits the generated id. With no initial value, the component falls back to its default child (first enabled one), as today.
4. Breaking changes, no aliases (same rule as the v6 migration).

## Audit

Every `defineModel` in `packages/bootstrap-vue-next/src` was checked (there are no hand-written `update:*` models besides the reka-ui date components' `placeholder` / `startValue`).

### Dual id + index models: switch to ids only

| Component    | Models today                                                                             | Change                                                                                                                                                                                                                                                                                         | Status                                                                          |
| ------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `BTabs`      | `v-model` (`string`, active tab id) + `v-model:index` (`number`, default `-1`)           | Remove `index` and `BTabsProps.index`; drive selection internally from `activeId` instead of `activeIndex`; remove the pre-mount `selectedTabHasExplicitId` / delayed-selection path that exists only to translate an initial index into an id. `BTab` `active` (per-tab boolean model) stays. | To do                                                                           |
| `BAccordion` | `v-model` (`string \| string[]`, open item ids) + `v-model:index` (`number \| number[]`) | Remove `index`; remove the id ↔ index translation in `sortAccordionItems`.                                                                                                                                                                                                                     | Already decided in the v6 Display research (G5 Q2); lands with the v6 Accordion |

`BTabs` usages to update: `v-model:index` in docs demos `TabsModelControl.vue`, `TabsActiveModelControl.vue`, `TabsExposedMethodControl.vue`, `TabsCustomLinks.vue`, playground `TTabs.vue`, `tabs.spec.ts`, `tabs.data.ts`, `tabs.md`, and the `btabs.md` migration page (which currently tells users to use `v-model:index`). `BAccordion`: `accordion.spec.ts`, `accordion.data.ts`, `accordion.md`.

### Single index-only models (audit only, not changed)

| Component                 | Model                                                | Children have ids?                         | Notes                                                                                                                           |
| ------------------------- | ---------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `BCarousel`               | `v-model` (`number`, 0-based slide index)            | Yes, `BCarouselSlide` has an optional `id` | Being rewritten for v6 (G5); its decided API also uses indexes in `slideTo` → `to(index)`, and `BvCarouselEvent` `from` / `to`. |
| `BStepper` (planned, new) | `v-model` (`number`, 0-based current step) per G5 Q9 | Not yet built                              | Steps are ordered by nature; items with index ≤ value render `.active`. G5 notes the model could even be a plain prop.          |

That is the whole list: **one existing component** (`BCarousel`) and one planned component (`BStepper`).

Index-shaped data outside models (not v-models, listed for completeness):

- `BTabs` `activate-tab` payload: `newTabId`, `prevTabId`, `newTabIndex`, `prevTabIndex`.
- `BCarousel` `slide` / `slid` events (`BvCarouselEvent.from` / `.to`) and exposed `slideTo(index)`.

### Not in scope: number models that aren't child positions

| Component                                                                                                                                                                                                                                           | Model                           | Why it stays                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------- |
| `BPagination`, `BTable` `currentPage`                                                                                                                                                                                                               | page number (1-based)           | A value, not the position of a rendered child |
| `BFormRating`, `BFormSpinbutton`, `BFormInput`, `BFormTextarea`                                                                                                                                                                                     | numeric/text value              | Values                                        |
| `BFormSelect`, `BFormRadioGroup`, `BFormCheckboxGroup`, `BFormTags`, `BFormOtp`, `BAutocomplete`, date/time fields                                                                                                                                  | option values / strings / dates | Already value-keyed, never positional         |
| `BTable` `selectedItems` / `expandedItems`, `BTableLite` `expandedItems`                                                                                                                                                                            | item objects                    | Already identity-keyed                        |
| `BTable` `sortBy`, `busy`, `items`                                                                                                                                                                                                                  | config / data                   | Not a selection                               |
| Boolean show/hide models (`BModal`, `BOffcanvas`, `BCollapse`, `BDropdown`, `BNavItemDropdown`, `BPopover`, `BTooltip`, `BToast`, `BAlert`, `BAccordionItem`, `BTab` `active`), `BButton` `pressed`, `BFormCheckbox` `indeterminate`, picker `open` | boolean                         | Not a selection                               |

## Is standardizing on ids everywhere practical?

Yes, and it is small: only `BCarousel` (plus the not-yet-built `BStepper`) would change, and `BCarousel` is already being rewritten for v6, so its v-model change would ride along with that rewrite instead of being a separate breaking change.

Trade-offs per component:

- **`BCarousel` → slide id.** Consistent with `BTabs` / `BAccordion`. Slides already accept `id`; unlabeled slides get generated ids. `next()` / `prev()` / autoplay stay positional internally. Cost: users who drive a carousel by number (`v-model="2"`, a counter, a thumbnail strip built with `v-for` index) must give slides ids or map index → id. `to()` and the event payloads would switch to ids too, or keep indexes for navigation only.
- **`BStepper` → step id.** Less natural: a stepper's state is inherently ordered ("everything up to the current step is done"), so the component still needs positions to render `.active` on earlier steps. An id model works (resolve id → position internally) but adds registration code for little user benefit, and wizard code usually counts steps.

Recommendation: **standardize `BCarousel` on ids in the v6 rewrite; keep `BStepper` index-based** (document it as the one ordered-progress exception), or make its value a plain `step` prop as G5 suggested. See Q1–Q2.

## Questions for the maintainer

### Q1. `BCarousel` model (Medium)

- **A. Switch to slide ids in the v6 rewrite** (recommended). `v-model` holds the active slide id; `to(id)`; `BvCarouselEvent` carries `fromId` / `toId` (Q3 decides whether indexes stay alongside).
- **B. Keep the index model.** No change for users; the library keeps one positional selection model.

### Q2. `BStepper` model (Low)

- **A. Keep index** (recommended): ordered progress is positional by nature.
- **B. Step id**, resolved to a position internally, for full consistency.
- **C. Plain `step` prop (index), no v-model**, since the stepper never changes the step itself.

### Q3. Index fields in event payloads (Low)

`BTabs` `activate-tab` has both ids and indexes; `BvCarouselEvent` has indexes.

- **A. Ids only in payloads** of components whose model is id-based. Fully consistent; users who need a position use the exposed state.
- **B. Ids as primary, keep indexes as informational extras** (recommended). No sync problem (payloads are read-only), and indexes are handy for animations and analytics.

## Decisions

Answered by the maintainer on 2026-11-09.

- **Q1 — A.** `BCarousel` switches to slide ids in the v6 rewrite: `v-model` holds the active slide id (generated when a slide has none), `to(id)`; `next()` / `prev()` / autoplay stay positional internally. This overrides the index-based model and `to(index)` in the G5 Display research.
- **Q2 — A.** `BStepper` keeps an index-based model (0-based current step), documented as the one ordered-progress exception to rule 1.
- **Q3 — B.** Event payloads carry ids as the primary fields and keep indexes as read-only extras: `BTabs` `activate-tab` stays as is; `BvCarouselEvent` gains `fromId` / `toId` next to `from` / `to`.

## Implementation split

1. **`BTabs` id-only model** (independent of the new-components work; can go on the v6 branch after #168): remove `index`, refactor selection onto `activeId`, update specs, `tabs.data.ts`, demos, playground, `tabs.md` and the `btabs.md` migration notes.
2. **`BAccordion`**: with the v6 Accordion rewrite (G5), already decided.
3. **`BCarousel`**: with the v6 Carousel rewrite (G5); update `carousel.data.ts` ("The index of the currently active slide") and the migration notes.
4. **`BStepper`**: built per Q2 in its G5 PR.

Required checks: those in `BOOTSTRAP_V6_MIGRATION.md` ("Required checks").
