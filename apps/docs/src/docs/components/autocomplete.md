---
description: 'Choose from a list of suggested values with full keyboard support. BAutocomplete wraps a text input with a dropdown of filterable options.'
---

## Overview

`BAutocomplete` provides a text input with a dropdown list of options that can be filtered as the user types. It is built on top of the [Reka UI Combobox](https://reka-ui.com/docs/components/combobox) primitives and styled with Bootstrap classes.

<<< DEMO ./demo/AutocompleteOverview.vue

## Options

Pass an array of strings to the `options` prop to populate the dropdown list. The user can type to filter the options and select one from the list.

## Custom filtering with `v-model:search`

By default, the component handles filtering internally. When you need more control — for instance to perform async fetching or custom filtering logic — you can bind the search term via `v-model:search` and supply your own filtered `options`.

<<< DEMO ./demo/AutocompleteCustomFilter.vue

## Async fetching with debounce

When options need to be fetched from an API you can combine `v-model:search` with a short debounce to avoid firing a request on every keystroke. Use a request counter (or `AbortController`) to discard stale responses so that a slow earlier request never overwrites results from a newer one.

<<< DEMO ./demo/AutocompleteAsync.vue

::: tip Concurrency
The example above increments a `currentRequestId` before each fetch and ignores any response whose id no longer matches. This is the simplest way to handle out-of-order responses without pulling in a full cancellation library.
:::

## Dynamic options

Options can be changed dynamically. The dropdown list will update to reflect the current options array.

<<< DEMO ./demo/AutocompleteDynamic.vue

## Disabled state

Set the `disabled` prop to prevent user interaction with the autocomplete.

<<< DEMO ./demo/AutocompleteDisabled.vue

## Accessibility

`BAutocomplete` follows the [WAI-ARIA Combobox Autocomplete List](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/) design pattern. Focus and keyboard navigation are fully managed by the underlying Reka UI primitives.

### Keyboard interactions

| Key                    | Description                                                                 |
| ---------------------- | --------------------------------------------------------------------------- |
| <kbd>Enter</kbd>       | When focus is on an item, selects the focused item                          |
| <kbd>ArrowDown</kbd>   | Opens the dropdown when focus is on the input. Moves focus to the next item |
| <kbd>ArrowUp</kbd>     | Opens the dropdown when focus is on the input. Moves focus to previous item |
| <kbd>Escape</kbd>      | Closes the dropdown and restores the selected item in the input             |
