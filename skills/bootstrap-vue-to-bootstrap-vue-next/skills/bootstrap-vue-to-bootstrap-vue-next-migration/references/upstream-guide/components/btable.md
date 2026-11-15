---
id: btable
components:
- BTable
- BTbody
- BThead
- BTfoot
- BTr
- BTh
- BTd
safeRewrite: false
manualReviewRequired: true
confidence: high
replacement:
  clearSelected(): selection.clearSelected()
  selectAll(): selection.selectAll()
  toggleSelectAll(): selection.toggleSelectAll()
  selectedItems: selection.selectedItems
  expandedItems: expansion.expandedItems
deprecated:
- clearSelected()
- selectAll()
- toggleSelectAll()
- selectedItems
- expandedItems
match:
- BTable
- empty-filtered
- filter-included-fields
- filter-ignored-fields
- filter-debounce
- no-sort-reset
- must-sort
- selected-variant
- selection-variant
- sort-changed
- update:sort-by
- sort-direction
- initial-sort-direction
- sort-compare
- multi-sort
- table-variant
---

# BTable Migration

## Summary

Migration notes for BTable from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BTable
- BTbody
- BThead
- BTfoot
- BTr
- BTh
- BTd

## Breaking Change

See the [v-html](../patterns/v-html-props.md) section for information on deprecation of the `html` prop.

The slot `emptyfiltered` has been renamed to `empty-filtered` for consistency.

The following features are not included in v1:

> **Deprecated / not supported** — this feature (not implemented (insufficient demand for initial release)).

The <code>no-footer-sorting</code> prop. Footer sorting can be controlled through table structure.

> **Deprecated / not supported** — this feature (not implemented (insufficient demand for initial release)).

RegExp support for the <code>filter</code> prop. Use the <code>filterFunction</code> prop for complex filtering logic.

> **Deprecated / not supported** — this feature (Vue 3 or Bootstrap 5 changes made this less relevant).

The <code>context-changed</code> event. Use the <code>change</code> event and the exposed <code>displayItems</code> function as demonstrated in [the documentation](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/table#complete-example).

> **Deprecated / not supported** — this feature (Vue 3 or Bootstrap 5 changes made this less relevant).

The <code>refreshed</code> event. Call the exposed <code>refresh()</code> method and watch <code>change</code> or <code>filtered</code> events.

`filter-included-fields` and `filter-ignored-fields` have been replaced by a single `filterable` prop.

`filter-debounce` has been replaced by `debounce`.

`no-sort-reset` is deprecated. Use `must-sort`. By default, sortability can be reset by clicking (3) times [asc => desc => undefined => asc...]

`selected-variant` has been renamed to `selection-variant` for internal consistency.

Sorting has been significantly reworked. Read the [sorting section](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/table#sorting) of our documentation. Some specific changes include the following:

- `sort-changed` event is replaced by the `update:sort-by` event.
- `sort-direction` has been renamed `initial-sort-direction` for clarity.
- The sort icons have been changed.
- The internal `sort-compare` routine has been simplified, if you need to customize sorting for localization, the documentation on [custom sort comparers](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/table#custom-sort-comparers) for details.
- `multi-sort` functionality has been implemented.

`table-variant` is replaced with `variant` for consistency.

The slot scope for `table-colgroup` slot now only contains the `fields` prop, with the `columns` prop removed.

BootstrapVue used the main v-model binding to expose a readonly version of the displayed items. This is deprecated. Instead,
use the exposed function `displayedItems` as demonstrated in [the documentation](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/table#complete-example).

The semantics of the `row-selected` event have changed. `row-selected` is now emitted for each selected
row and sends the single row's item as it's parameter. There is a new matching event called `row-unselected`
that is emitted for each row that is unselected. There is also a named model `selectedItems` that behaves
like the BSV `row-selected` event, emitting an array of all seleted rows. An example of this is available
in [the documentation](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/table#row-select-support)

All row-level events (`row-clicked`, `row-dblclicked`, `row-hovered`, `row-unhovered`,
`row-contextmenu`, `row-middle-clicked`) now emit a single payload object with `{item, index, event}`
instead of positional arguments. The `head-clicked` event likewise now emits
`{key, field, event, isFooter}` as one object payload.

BootstrapVue adds utility classes to the `<table>` including `b-table-select-single`,`b-table-select-multi`, and `b-table-select-range`, these have been deprecated, as the functionality should be easily replicated by the developer without adding to the API surface.

> **Deprecated / not supported** — this feature (not implemented (insufficient demand for initial release)).

The <code>aria-multiselect</code> attribute. Modern screen readers handle table selection adequately.

> **Deprecated / not supported** — this feature (a modern alternative exists).

The <code>label-sort-clear</code>, <code>label-sort-asc</code>, and <code>label-sort-desc</code> props. These provided hidden text for screen readers to indicate sorting actions. BTable now uses proper ARIA attributes (<code>aria-label</code>, <code>aria-sort</code>) on header elements which provide the same accessibility information in a modern, standards-compliant way.

Helper components (`BTbody`, `BThead`, `BTfoot`, `BTr`, `BTh`, `BTd`) use semantic HTML elements that provide implicit ARIA roles. `BTh` automatically calculates the `scope` attribute based on `colspan` and `rowspan` props.

The `filtered` event has a single argument `Item[]` rather than two arguments with an array and length. The semantics haven't changed.

Heading and data row accessibility is implemented via keyboard navigation (tab and arrow keys for sortable headers and selectable rows) and proper semantic HTML structure.

### Row Expansion (formerly Row Details)

**Terminology changes:** BootstrapVue used "details" terminology for expanding rows, which has been changed to "expansion" for clarity and linguistic correctness. The following changes have been made:

- Scoped slot variable `detailsShowing` is now `expansionShowing`
- Scoped slot function `toggleDetails` is now `toggleExpansion`
- The concept of "detailed items" is now "expanded items"

**v-model instead of object property:** The expansion state is no longer tracked using a property on item objects. Instead, use the `v-model:expanded-items` binding to manage which rows are expanded.

**Before (BootstrapVue):**

```vue
<template>
  <BTable :items="items">
    <!-- @ts-expect-error - BSV pattern no longer supported -->
    <template #cell(show_details)="row">
      <!-- @ts-expect-error - BSV pattern no longer supported -->
      <BButton @click="row.toggleDetails">
        <!-- @ts-expect-error - BSV pattern no longer supported -->
        {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
      </BButton>
    </template>
    <!-- @ts-expect-error - BSV slot name no longer supported -->
    <template #row-details="row">
      <BCard>{{ row.item.fullDetails }}</BCard>
    </template>
  </BTable>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck -- BSV example demonstrating deprecated patterns
const items = [
  {name: 'Item 1', fullDetails: 'Full details for Item 1'},
  {name: 'Item 2', fullDetails: 'Full details for Item 2'},
]
// Expansion was controlled via _showDetails property on items
</script>
```

**After (BootstrapVueNext):**

```vue
<template>
  <BTable v-model:expanded-items="expandedItems" :items="items">
    <template #cell(show_details)="row">
      <BButton @click="row.toggleExpansion">
        {{ row.expansionShowing ? 'Hide' : 'Show' }} Details
      </BButton>
    </template>
    <template #row-expansion="row">
      <BCard>{{ row.item?.fullDetails }}</BCard>
    </template>
  </BTable>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const items = [
  { name: 'Item 1', fullDetails: 'Full details for Item 1' },
  { name: 'Item 2', fullDetails: 'Full details for Item 2' },
]

// Expansion state managed via v-model
const expandedItems = ref([items[0]]) // Expand first item by default
</script>
```

**Using with Primary Key:**

When using a `primary-key`, expansion state persists across item array updates (like pagination or "Load more"). To set default expanded items with a `primary-key`, you must use the table's template ref `expansion.get()` function:

```vue
<template>
  <BTable
    ref="tableRef"
    v-model:expanded-items="expandedItems"
    :items="items"
    primary-key="id"
  >
    <!-- ... -->
  </BTable>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import {onMounted, ref} from 'vue'

const tableRef = ref()
const items = [
  {id: 1, name: 'Item 1'},
  {id: 2, name: 'Item 2'},
]
const expandedItems = ref<any[]>([])

// Set default expanded items after mount
onMounted(() => {
  expandedItems.value.push(tableRef.value.expansion.get(items[1]))
})
</script>
```

The slot name remains `row-expansion` (changed from `row-details` in earlier versions).

### Template Ref API

**BREAKING: Template ref API reorganized into namespaced structure**

The BTable template ref API has been reorganized from a flat structure to a namespaced structure with `expansion` and `selection` properties. This improves organization and makes it clearer which methods and properties relate to which feature.

**Selection API changes:**

Methods and properties related to row selection are now accessed via `ref.selection.*`:

- `clearSelected()` → `selection.clearSelected()`
- `selectAll()` → `selection.selectAll()`
- `toggleSelectAll()` → `selection.toggleSelectAll()`
- `selectedItems` → `selection.selectedItems`

**Expansion API changes:**

Methods and properties related to row expansion are now accessed via `ref.expansion.*`:

- `expandedItems` → `expansion.expandedItems`
- New methods available: `expansion.expandAll()`, `expansion.collapseAll()`, `expansion.toggleExpandAll()`

**Before (flat structure):**

```vue
<template>
  <BTable
    ref="tableRef"
    :items="items"
    selectable
  >
    <BButton @click="handleClearSelection">Clear Selection</BButton>
    <BButton @click="handleSelectAll">Select All</BButton>
  </BTable>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const tableRef = ref()
const items = [{name: 'Item 1'}, {name: 'Item 2'}]

const handleClearSelection = () => {
  tableRef.value.clearSelected()
}

const handleSelectAll = () => {
  tableRef.value.selectAll()
}

// Access selected items
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getSelectedItems = () => tableRef.value.selectedItems
</script>
```

**After (namespaced structure):**

```vue
<template>
  <BTable
    ref="tableRef"
    :items="items"
    selectable
  >
    <BButton @click="handleClearSelection">Clear Selection</BButton>
    <BButton @click="handleSelectAll">Select All</BButton>
  </BTable>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const tableRef = ref()
const items = [{name: 'Item 1'}, {name: 'Item 2'}]

const handleClearSelection = () => {
  tableRef.value.selection.clearSelected()
}

const handleSelectAll = () => {
  tableRef.value.selection.selectAll()
}

// Access selected items
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getSelectedItems = () => tableRef.value.selection.selectedItems
</script>
```

**Expansion API example:**

```vue
<template>
  <BTable
    ref="tableRef"
    v-model:expanded-items="expandedItems"
    :items="items"
  >
    <BButton @click="handleExpandAll">Expand All</BButton>
    <BButton @click="handleCollapseAll">Collapse All</BButton>
  </BTable>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const tableRef = ref()
const expandedItems = ref([])
const items = [{name: 'Item 1'}, {name: 'Item 2'}]

const handleExpandAll = () => {
  tableRef.value.expansion.expandAll()
}

const handleCollapseAll = () => {
  tableRef.value.expansion.collapseAll()
}
</script>
```

### Item Provider Functions

To use an items provider, set the `provider` prop to a provider function and leave the
`items` prop undefined (unlike in BootstrapVue, where the `items` prop was overloaded). See
our [documentation](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/table#using-items-provider-functions) for details.

The items provider function `ctx` parameter now contains `sortBy` array rather than `sortBy` and `sortDesc` fields -
see the [sorting docs](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/table#sorting) for details

The table prop `api-url` and the items provider function `ctx` parameter `apiUrl` field are both deperecdated
as they are easily replaced by direct management of the api call by the user.

The items provider no longer includes an optional callback parameter, use the async method of calling instead.

### Field Definitions

**BREAKING: `field.key` no longer supports nested paths**

In BootstrapVue, the `field.key` property could be set to nested string paths like `name.firstName` to access nested properties. This is no longer supported. The `key` property must now be a simple string identifier used only for column identification and slot names.

**New `accessor` property for data access**

To access nested or computed data, use the new optional `accessor` property:

- For root-level properties: The `accessor` can be a string matching a root property name (e.g., `'email'`)
- For nested or computed values: The `accessor` should be a function that receives the row item and returns the value
- If omitted, the `key` property is used by default (for root-level properties only)

**Before (BootstrapVue):**

```typescript
const fields = [
  { key: 'name.first', label: 'First Name' },
  { key: 'name.last', label: 'Last Name' },
  { key: 'age', label: 'Age' },
]
```

**After (BootstrapVueNext):**

```typescript
const fields = [
  {
    key: 'firstName',
    label: 'First Name',
    accessor: (item: any) => item.name.first,
  },
  {
    key: 'lastName',
    label: 'Last Name',
    accessor: (item: any) => item.name.last,
  },
  { key: 'age', label: 'Age' }, // Simple root property works as before
]
```

**BREAKING: Function signatures changed to use single parameter objects**

The following TableField properties now accept a single parameter object instead of multiple positional parameters:

- `formatter`: Now receives `{value, key, item}` instead of `(value, key, item)`
- `tdAttr`: Now receives `{value, key, item}` instead of `(value, key, item)`
- `thAttr`: Now receives `{value, key, item, type}` instead of `(value, key, item, type)`

**Before (BootstrapVue):**

```typescript
import type { TableField } from 'bootstrap-vue-next'

const fields: TableField[] = [
  {
    key: 'status',
    formatter: (value) => String(value.value).toUpperCase(),
    tdAttr: (value) => ({
      class: value.value === 'active' ? 'text-success' : '',
    }),
  },
]
```

**After (BootstrapVueNext):**

```typescript
const fields = [
  {
    key: 'status',
    formatter: ({ value, key, item }: { value: any; key: any; item: any }) => value.toUpperCase(),
    tdAttr: ({ value, key, item }: { value: any; key: any; item: any }) => ({
      class: value === 'active' ? 'text-success' : '',
    }),
  },
]
```

`formatter` Only the callback function value for this field is implemented, adding the name
of a method in the component is deprecated.

`sortKey` and `sortDirection` are deprecated, use the table's `sortBy` model as documented [here](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/table#sorting) instead.

`filterByFormatted` is implemented, but does not take a format function as an argument.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- [v-html-props](../patterns/v-html-props.md)

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
