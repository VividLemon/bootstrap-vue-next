---
title: Utility Classes
description: >
  Bootstrap 6 CSS provides utility and helper classes to control color, spacing, flex-box,
  text alignment, motion, theming, responsive display and much more. They work on every
  BootstrapVueNext component through the class attribute.
---

## Overview

Every BootstrapVueNext component passes the `class` attribute to its root element, so Bootstrap's
[utilities](https://getbootstrap.com/docs/6.0/utilities/api/) and
[helpers](https://getbootstrap.com/docs/6.0/helpers/) work on components exactly as on plain
elements. Responsive utilities use the v6 prefix syntax (`md:d-none`, `lg:gap-3`) and compare against
the viewport. A few component classes use container queries instead; see
[Container queries](/docs/reference/container-queries).

The library only adds a prop when a component clearly benefits from it. The helpers below are used as
classes, except hover lift on cards.

## Hover lift

`.hover-lift` lifts an element and deepens its shadow on `:hover` and `:focus-visible`. The motion is
skipped when the user prefers reduced motion. Tune it with the `--bs-hover-lift-transform`,
`--bs-hover-lift-box-shadow`, `--bs-hover-lift-transition-duration` and
`--bs-hover-lift-transition-timing` CSS variables.

`BCard` has a `hover-lift` prop for it. On other components add the class:

```vue-html
<BCard hover-lift title="Lifted card">…</BCard>
<BButton class="hover-lift">Lifted button</BButton>
```

## Theme utilities

Bootstrap 6 `.theme-*` classes (`.theme-primary`, `.theme-contrast`, `.theme-subtle`, …) set the theme
tokens of a subtree. Components already expose them through the `color` prop (`color.theme`, with the
`contrast`, `subtle`, `muted`, `border` and `reset` modifiers); see
[Color variants](/docs/reference/color-variants). Use the classes directly on plain elements.

## Color scheme

`.color-scheme-light`, `.color-scheme-dark` and `.color-scheme-auto` set the CSS `color-scheme`
property, which changes how the browser draws its own controls and scrollbars. This is different from
`data-bs-theme` (set with [`useBootstrapColorMode`](/docs/composables/useBootstrapColorMode) or
[`v-b-color-mode`](/docs/directives/BColorMode)), which switches Bootstrap's own color tokens. Use both
when a region should look dark, including native form controls.

## Motion

| Class                                | Effect                                                         |
| ------------------------------------ | -------------------------------------------------------------- |
| `.transition-none`                   | Disables transitions on the element                            |
| `.animation-none`                    | Disables animations on the element                             |
| `.animation-shake`, `.animation-pop` | Plays a one-off shake or pop animation when the class is added |

Components with a transition also have a `no-transition` prop.

## Space and divide

`.space-x-{0-12}` / `.space-y-{0-12}` add a margin between direct children (on the spacing scale),
and `.divide-x` / `.divide-y` draw a border between direct children (`.divide-x-0` / `.divide-y-0`
remove it). Both have responsive variants (`md:space-y-3`), based on the viewport.

```vue-html
<div class="d-flex space-x-3 divide-x">
  <span>One</span>
  <span>Two</span>
  <span>Three</span>
</div>
```

## Prose

Bootstrap 6's `.prose` class styles a block of rich content (headings, lists, links, tables, images,
blockquotes) without classes on each element, such as Markdown rendered to HTML. There is no `BProse`
component: put the class on your own element. Wrap library components inside the content in
`.not-prose` so the prose styles don't change them.

```vue-html
<article class="prose">
  <div v-html="renderedMarkdown" />
  <div class="not-prose">
    <BCard title="Related">…</BCard>
  </div>
</article>
```

Only pass trusted or sanitized HTML to `v-html`. See the
[Bootstrap prose documentation](https://getbootstrap.com/docs/6.0/content/prose/) for the styled
elements and the CSS variables.

## Container queries

`.contains-inline` and `.contains-size` turn an element into a query container. See
[Container queries](/docs/reference/container-queries).
