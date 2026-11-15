# Public `useTable` composable (maybe)

A post-migration possibility, not part of the Bootstrap v6 component work. Recorded here with the other v6 plans so it isn't lost; it does not block any group.

Status: a possibility, not a commitment. Decide after the migration, based on a benchmark.

Idea: add a public `useTable` composable with BTable's logic (sorting, filtering, paging, the items provider, selection, expansion, keyboard navigation), so users can drive `BTableLite` directly without the BTable wrapper. BTable stays, rewritten as a thin wrapper (`useTable(...)` plus `<BTableLite>`), so existing users keep the full component.

Why: performance. BTable renders `<BTableLite>` and forwards its slots with `v-if`, `v-for` and dynamic names. The Vue compiler marks such slots as dynamic (`DYNAMIC_SLOTS`), and `shouldUpdateComponent` then re-renders `BTableLite` every time BTable re-renders, without comparing props. Every cell and head slot also passes through an extra slot function that creates closures for each cell on each render. A user's own component with static slot names on `<BTableLite>` avoids both.

Most of the logic is already in composables (`useTableSort`, `useTableProvider`, `useTableSelectedItems`, `useItemExpansion`, `useTableMapper`, `useTableKeyboardNavigationInjector`); BTable's script is mostly wiring between them, its `defineModel`s and its emits.

Steps:

1. Benchmark first: mount a 1,000-row × 10-column table and toggle `busy` and a selection, comparing BTable, BTableLite with the same data, and BTableLite rendering plain `<tr>` / `<td>` instead of `BTr` / `BTd` components. Count `BTableLite` renders. If the wrapper's share is small, stop here.
2. Backfill `BTableLite` with the parts BTable renders, because a composable cannot render markup: the `table-busy` row, the `empty` / `empty-filtered` row (with `showEmpty` and `empty`), and the visually hidden sort label in sortable headers.
3. Extract `useTable` from BTable's script. Models become refs the caller passes (`sortBy`, `selectedItems`, `expandedItems`, `currentPage`, `busy`). Instead of adding `selectRow` / `unselectRow` / `rowSelected` / `selectAllRows` / `clearSelected` to slot scopes, return functions (`select`, `unselect`, `isSelected`, `selectAll`, `clear`) for users to call in their own slots. It calls `provide` for keyboard navigation, so it must run in the setup of the component that renders `BTableLite`.
4. Rewrite BTable as `useTable` plus `<BTableLite>`, keeping its public API and slot scopes unchanged.
5. Export and document `useTable` as public API; it follows the composable export conventions and is SSR-safe like the rest of the library.

Cost to weigh: `useTable`'s return shape (especially the props it binds onto `BTableLite`) becomes public API tied to `BTableLite`'s props, so later `BTableLite` changes touch two public APIs.

Related, possibly larger: `BTableLite` renders every cell as a `BTd` / `BTh` component and every row as a `BTr`, so a 1,000 × 10 table creates over 10,000 component instances. Rendering plain elements with computed classes inside `BTableLite` (keeping `BTr` / `BTd` / `BTh` for `BTableSimple` users) may matter more than the wrapper. The benchmark in step 1 measures both.
