---
title: Accordion
description: 'Build vertically collapsing accordions with native HTML `<details>` and `<summary>` elements.'
---

## How it works

`BAccordionItem` renders a native `<details>` element with a `<summary>` header, following Bootstrap v6. No JavaScript is needed for the core show/hide behavior. When `free` is not set, the items share the accordion `id` as their `name`, so the browser closes other items when one opens. Use `v-model` on `BAccordion` (item ids) or on `BAccordionItem` (boolean) to control the open state.

<BAlert variant="info" :model-value="true" class="my-5">

The height animation requires [`interpolate-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/interpolate-size) support, and respects the prefers-reduced-motion media query.

</BAlert>

## Example

Click the accordions below to expand/collapse the accordion content.

<<< DEMO ./demo/AccordionOverview.vue#template{vue-html}

### Flush

Add `flush` property to remove the default background-color, some borders, and some rounded corners to render accordions edge-to-edge with their parent container.

<<< DEMO ./demo/AccordionFlush.vue#template{vue-html}

### Always open

Add `free` property to make accordion items stay open when another item is opened.

<<< DEMO ./demo/AccordionFree.vue#template{vue-html}
