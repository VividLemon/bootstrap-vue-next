# Pagination

<PageHeader>

Quick first, previous, next, last, and page buttons for pagination control of another component
(such as `BTable` or lists).

</PageHeader>

## Overview

`<BPagination>` is a custom input component that provides a current page number input control. The
value should be bound via `v-model` in your app. Page numbers are indexed from 1. The number of
pages is computed from the provided prop values for `total-rows` and `per-page`.

**Example Usage with `<BTable>`:**

<<< DEMO ./demo/PaginationOverview.vue

## Customizing appearance

`BPagination` supports several props/slots that allow you to customize the appearance. All
`*-text` props are text-only and strip out HTML, but you can use their equally named slot
counterparts for that.

### Limiting the number of displayed buttons

To restrict the number of page buttons (including the ellipsis, but excluding the first, prev, next,
and last buttons) shown, use the `limit` prop to specify the desired number of page buttons
(including the ellipsis, if shown). The default `limit` is `5`. The minimum supported value is `3`.
When `limit` is set to `3`, no ellipsis indicators will be shown for practical purposes.

The `first` and `last` buttons can be optionally hidden by setting the `hide-goto-end-buttons` prop.

The showing of the `ellipsis` can be optionally disabled by setting the `hide-ellipsis` prop.

#### Small screen support

On smaller screens (i.e. mobile), some of the `BPagination` buttons will be hidden to minimize
the potential of the pagination interface wrapping onto multiple lines:

- The ellipsis indicators will be hidden on screens `xs` and smaller
- Page number buttons will be limited to a maximum of 3 visible on `xs` screens and smaller

This ensures that no more than 3 page number buttons are visible, along with the goto _first_,
_prev_, _next_, and _last_ buttons.

### Button content

For a full list of all available slots see the [Slots](#comp-reference-bpagination-slots) section below.

<<< DEMO ./demo/PaginationButtonContent.vue

The slot `page` is always scoped, while the slots `first-text`, `prev-text`, `next-text` and
`last-text` are optionally scoped. The `ellipsis-text` slot is not scoped.

**Scoped variables properties available to the `page` slot:**

| Property   | Type    | Description                                          |
| ---------- | ------- | ---------------------------------------------------- |
| `page`     | Number  | Page number (from `1` to `numberOfPages`)            |
| `index`    | Number  | Page number (indexed from `0` to `numberOfPages -1`) |
| `active`   | Boolean | If the page is the active page                       |
| `disabled` | Boolean | If the page button is disabled                       |
| `content`  | String  | Page number as a string                              |

**Scoped variables properties available to the `first-text`, `prev-text`, `next-text` and
`last-text` slots:**

| Property   | Type    | Description                                          |
| ---------- | ------- | ---------------------------------------------------- |
| `page`     | Number  | Page number (from `1` to `numberOfPages`)            |
| `index`    | Number  | Page number (indexed from `0` to `numberOfPages -1`) |
| `disabled` | Boolean | If the page button is disabled                       |

### Goto first/last button type

If you prefer to have buttons with the first and last page number to go to the corresponding page,
use the `first-number` and `last-number` props.

<<< DEMO ./demo/PaginationFirstLast.vue

### Button size

Optionally change from the default button size by setting the `size` prop to either `'sm'` for
smaller buttons or `'lg'` for larger buttons.

<<< DEMO ./demo/PaginationButtonSize.vue

### Pill style

Easily switch to pill style buttons by setting the `pills` prop.

<<< DEMO ./demo/PaginationPillStyle.vue

**Note:** Pill styling requires bootstrap-vue-next's custom CSS/SCSS.

### Alignment

By default, the pagination component is left aligned. Change the alignment to `center`, `end`
or `fill` by setting the prop `align` to the appropriate value.

<<< DEMO ./demo/PaginationAlignment.vue

## Preventing a page from being selected

You can listen for the `page-click` event, which provides an option to prevent the page from being
selected. The event is emitted with two arguments:

- `BvEvent`: The `BvEvent` object. Call `BvEvent.preventDefault()` to cancel page selection
- `page`: Page number to select (starting with `1`)

For accessibility reasons, when using the `page-click` event to prevent a page from being selected,
you should provide some means of notification to the user as to why the page is not able to be
selected. It is recommended to use the `disabled` attribute on the `BPagination` component
instead of using the `page-click` event (as `disabled` is more intuitive for screen reader users).

## Accessibility

The `BPagination` component provides many features to support assistive technology users, such as
`aria-` attributes and keyboard navigation.

### `aria-controls`

When pagination is controlling another component on the page (such as `BTable`), set the
`aria-controls` prop to the `id` of the element it is controlling. This will help non-sighted users
know what component is being updated/controlled.

### ARIA labels

`BPagination` provides various `label-*` props which are used to set the `aria-label`
attributes on the various elements within the component as well as the common `aria-label` prop
on the outer container, which will help users of assistive technology.

| Prop               | `aria-label` content default                            |
| ------------------ | ------------------------------------------------------- |
| `label-first-page` | "Goto first page"                                       |
| `label-prev-page`  | "Goto previous page"                                    |
| `label-next-page`  | "Goto next page"                                        |
| `label-last-page`  | "Goto last page"                                        |
| `label-page`       | "Goto page", appended with the page number              |
| `aria-label`       | "Pagination", applied to the outer pagination container |

The `label-page` will optionally accept a function to generate the aria-label. The function is
passed a single argument which is the page number (indexed from 1 to number of pages).

You can remove any label by setting the prop to an empty string (`''`), although this is not
recommended unless the content of the button textually conveys its purpose.

### Keyboard navigation support

`<BPagination>` supports keyboard navigation out of the box, and follows the
[WAI-ARIA roving tabindex](https://www.w3.org/TR/wai-aria-practices-1.2/#kbd_roving_tabindex)
pattern.

- Tabbing into the pagination component will autofocus the current active page button
- <kbd>Left</kbd> (or <kbd>Up</kbd>) and <kbd>Right</kbd> (or <kbd>Down</kbd>) arrow keys will focus
  the previous and next buttons, respectively, in the page list
- <kbd>Enter</kbd> or <kbd>Space</kbd> keys will select (click) the currently focused page button
- Pressing <kbd>Tab</kbd> will move to the next control or link on the page, while pressing
  <kbd>Shift</kbd>+<kbd>Tab</kbd> will move to the previous control or link on the page.

<ComponentReference :data="data" />

<script setup lang="ts">
import {data} from '../../data/components/pagination.data'
</script>
