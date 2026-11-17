---
title: Accordion
description: 'Build vertically collapsing accordions on native `<details>` and `<summary>` elements.'
---

## How it works

`BAccordionItem` renders Bootstrap's v6 accordion markup: a native `<details class="accordion-item">`
with a `<summary class="accordion-header">` and a `.accordion-body`. The browser opens and closes
the item; no JavaScript collapse is involved. Items in a `BAccordion` share a `name` attribute, so
opening one closes the others.

<BAlert :color="{ theme: 'info' }" :model-value="true" class="my-5">

The open/close animation uses `interpolate-size` on the `::details-content` pseudo-element and only
runs when the user has no reduced-motion preference. Browsers without `interpolate-size` open and
close items without animation.

</BAlert>

## Example

Click the headers below to expand or collapse the content. `v-model` on `BAccordion` holds the id of
the open item.

<<< DEMO ./demo/AccordionOverview.vue

### Flush

Add the `flush` prop to remove the outer borders and rounded corners and render the accordion
edge-to-edge with its parent container.

<<< DEMO ./demo/AccordionFlush.vue#template{vue-html}

### Always open

Add the `free` prop to keep items open when another item opens. Items then get no shared `name`,
and `v-model` holds an array of the open item ids.

<<< DEMO ./demo/AccordionFree.vue#template{vue-html}

### Gap

The `gap` prop separates the items (`.accordion-gap`). Change the distance with the
`--bs-accordion-gap` CSS variable.

<<< DEMO ./demo/AccordionGap.vue#template{vue-html}

### Size

`size="sm"` renders a compact accordion (`.accordion-sm`).

<<< DEMO ./demo/AccordionSize.vue#template{vue-html}

### Color

The `color` prop's `theme` key colors the header and border of open items.

<<< DEMO ./demo/AccordionColor.vue#template{vue-html}

### Custom title and icon

The `title` slot replaces the `title` prop and the `icon` slot replaces the default chevron. Both
receive `open`.

<<< DEMO ./demo/AccordionIcon.vue#template{vue-html}

## State

- `BAccordion` `v-model` holds the id of the open item (`string | undefined`), or an array of ids
  with `free`. Give items an `id` to control them; ids are generated otherwise.
- Each `BAccordionItem` also has a boolean `v-model`. It follows changes made by the browser
  (clicks, keyboard, find-in-page, fragment links, and siblings closed through the shared `name`).
- The `toggle` event is the native `ToggleEvent` of the `<details>`. It fires after the change and
  cannot be canceled. There are no `show`, `shown`, `hide` or `hidden` events.
- Accordion items are not part of the show/hide registry: `v-b-toggle` and `useToggle` do not
  target them. Use `v-model` instead.
- Set `name` on `BAccordion` to override the shared name, for example to make items of two
  accordions close each other.

An item can be used without `BAccordion`; it is then a plain `<details>` with its own `v-model`.
Bootstrap declares the accordion tokens on `.accordion`, so keep an `.accordion` wrapper.

<<< DEMO ./demo/AccordionStandalone.vue

## Lazy content

Set `lazy` on an item (or on `BAccordion` for all items) to render the body content on its first
open; it then stays rendered. Lazy content is not in the page until opened, so find-in-page cannot
find it.

## Transitions

Set `no-transition` on `BAccordion` or on an item to open and close without animation. It sets the
accordion transition tokens (`--bs-accordion-panel-transition-duration`,
`--bs-accordion-transition-duration`, `--bs-accordion-btn-icon-transition`) inline, because the
`transition-none` utility does not reach `::details-content`.

## Accessibility

`<summary>` is focusable and toggles with <kbd>Enter</kbd> and <kbd>Space</kbd>; assistive
technology announces the expanded state, so no ARIA attributes are needed. Headings placed inside
the `title` slot are not reliably exposed as headings, because `<summary>` has a button role.
