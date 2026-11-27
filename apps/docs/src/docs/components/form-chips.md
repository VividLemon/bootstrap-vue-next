---
title: Form Chips
description: 'Compact chips and a chip input for entering a list of values, built on the Bootstrap v6 Chips component.'
---

<<< DEMO ./demo/FormChipsOverview.vue

## Overview

`BFormChips` renders Bootstrap v6's chip input: a `.chip-input` wrapper (styled like a form
control) containing a chip per value and a borderless text input. `v-model` is a `string[]`.

- Press <kbd>Enter</kbd>, or type the `separator` (default `,`), to add the typed text as a chip.
  Pasted text is split on the separator too. With `create-on-blur` (default) the text is also
  added when the input loses focus.
- Values are trimmed; empty values and duplicates (unless `allow-duplicates`) are ignored, and
  `max-chips` limits the count.

`BFormChips` replaces `BFormTags` (and `BChip` replaces `BFormTag`).

## Chips

`BChip` is the standalone chip. Use `active` for the selected style, `color` to change the theme,
the `icon` and `img` slots for a leading icon or image (bind the `img` slot's `props` on your
image: `<template #img="{ props }"><img v-bind="props" src="..." alt="" /></template>`), and
`dismissible` for a dismiss button that emits `remove`.

<<< DEMO ./demo/FormChipsChip.vue#template{vue-html}

## Validating values

There is no built-in validator: listen to the cancelable `add` event and call
`event.preventDefault()` to reject a value. Show messages through
[`BFormGroup`](/docs/components/form-group) feedback; its label targets the chip input's text
input.

<<< DEMO ./demo/FormChipsValidation.vue

## Keyboard and selection

| Key                                                     | Action                                                                              |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| <kbd>Enter</kbd> / separator                            | Adds the typed text                                                                 |
| <kbd>Backspace</kbd> in an empty input                  | Selects and focuses the last chip; press it again to remove the chip                |
| <kbd>←</kbd> at the start of the input                  | Selects the last chip                                                               |
| <kbd>←</kbd> / <kbd>→</kbd> on a chip                   | Moves the selection (<kbd>Shift</kbd> extends it); → past the end focuses the input |
| <kbd>Home</kbd> / <kbd>End</kbd> on a chip              | First chip / back to the input                                                      |
| <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>A</kbd> on a chip | Selects every chip                                                                  |
| <kbd>Backspace</kbd> / <kbd>Delete</kbd> on a chip      | Removes the selected chips                                                          |
| <kbd>Escape</kbd>                                       | Clears the selection (and the input)                                                |

Click selects a chip, <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>-click toggles one and <kbd>Shift</kbd>-click
selects a range. Selected chips get `.active` and `aria-pressed="true"`; the `select` event reports
the selected values.

## Custom chips

Use the `chip` slot to render each chip yourself. Bind the scope's `props` on the chip element
(`<BChip v-bind="props">`): they carry `data-bs-chip-value`, `tabindex` and `aria-pressed`, and
keyboard navigation and selection find the chip by `data-bs-chip-value`. The chip may sit inside a
wrapper.

<<< DEMO ./demo/FormChipsCustom.vue#template{vue-html}

## Forms

Set `name` to submit the values: `BFormChips` renders one hidden input per value. `required` is
set on the text input only while there are no chips. Set `state` for the validation style.

## Accessibility

Each chip is focusable; its dismiss button is labelled `"{dismiss-label} {value}"` and left out of
the tab order (the chip handles the keyboard).
