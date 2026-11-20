---
title: useScrollspy
description: 'The `useScrollspy` composable tracks which section of a scrolling element is in view, following the Bootstrap 6 Scrollspy algorithm. It reads the sections from the links of a navigation element and returns the active section id, so you bind the active state of your navigation yourself.'
---

## Overview

`useScrollspy(content, target, options)` is the Vue counterpart of Bootstrap 6
[Scrollspy](https://getbootstrap.com/docs/6.0/components/scrollspy/):

- `content` is the element being spied on: a scrolling container, or any element when the page
  itself scrolls. When its `overflow-y` is not `visible` it is the scroll root, otherwise the
  viewport is.
- `target` is the navigation element. Each link in it (`[href]` with a `#hash`, not disabled) whose
  hash matches the `id` of a visible element inside `content` becomes a section. Without a target,
  `document.body` is used.
- The active section is the deepest one whose top has crossed an activation line placed
  `topMargin` (default `12%`) below the top of the scroll root. In a gap between sections the last
  active one stays active, above the first section the first one is active, and once the end of the
  content is reached the last section is active.

The composable is **reactive only**: it never adds classes or attributes to your links. Bind the
active state from `current` (and `activeIds` for nested navigation), and set
`aria-current="location"` on the active link so screen readers announce it.

Each element can be given as a template ref, a component instance, an element, or a selector /
id string. Everything runs after mount, so `current` is `null` during server-side rendering.

<<< DEMO ./demo/UseScrollspyBasic.vue

::: tip Accessibility
A scrolling container without focusable children needs `tabindex="0"` so keyboard users can scroll
it. Visual order and DOM order of the sections should match.
:::

## Smooth scrolling

With `smoothScroll: true`, clicking a link of the target scrolls smoothly to its section. When the
scroll settles, the URL hash is replaced (no history entry is added) and focus moves to the section
(it gets `tabindex="-1"` if it is not focusable). With reduced motion, or when the section is already
in place, the scroll is instant.

`scrollTo(id)` does the same from code, for example for a button. It also accepts a click event, in
which case it uses the clicked link and prevents its default navigation.

<<< DEMO ./demo/UseScrollspySmoothScroll.vue

## Nested navigation

`activeIds` holds the active section id followed by the ids of its parent sections, found the way
Bootstrap activates parents: the previous `.nav-link` or `.list-group-item` sibling of each `.nav` /
`.list-group` around the active link. With `BNavItem`, place the nested `BNav` in the `after` slot so
it follows the parent link. `activeLinks` holds the matching link elements, including the
`[data-bs-toggle="menu"]` toggle when the active link is a `.menu-item`.

<<< DEMO ./demo/UseScrollspyNested.vue

## Activation line below a sticky header

`topMargin` takes a percentage of the scroll root height or pixels. Use pixels to place the line
just below a sticky header. A pixel value is recalculated when the window is resized.

<<< DEMO ./demo/UseScrollspyTopMargin.vue

## Dynamic content

With `watchChanges` (on by default) the composable re-scans the links and sections whenever children,
`href` or `id` attributes change in the content or the target. Call `refresh()` yourself after other
layout changes, or with `watchChanges: false`.

<<< DEMO ./demo/UseScrollspyDynamicContent.vue

## Options

The options can be a plain object, a ref or a getter. A change re-runs `refresh()`.

| Option         | Type                 | Default | Description                                                                                                        |
| -------------- | -------------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| `topMargin`    | `string`             | `'12%'` | Activation line measured from the top of the scroll root, in `%` of the root height or `px`                        |
| `rootMargin`   | `string \| null`     | `null`  | Raw IntersectionObserver `rootMargin`; when set it overrides `topMargin`                                           |
| `threshold`    | `number \| number[]` | `[0]`   | IntersectionObserver `threshold`                                                                                   |
| `smoothScroll` | `boolean`            | `false` | Smoothly scroll to the section of a clicked target link, then replace the URL hash and focus the section           |
| `watchChanges` | `boolean`            | `true`  | Re-scan sections when children, `href` or `id` change in the content or the target (batched to one refresh a tick) |

See [`UseScrollspyOptions`](/docs/types#usescrollspyoptions).

## Return values

| Property      | Type                                                                | Description                                                                                                                                      |
| ------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `current`     | `Readonly<Ref<string \| null>>`                                     | Id of the active section; `null` until the first activation after mount                                                                          |
| `activeIds`   | `Readonly<Ref<readonly string[]>>`                                  | The active section id followed by the ids of its parent sections in nested navigation                                                            |
| `activeLinks` | `Readonly<Ref<readonly HTMLElement[]>>`                             | The active link followed by the parent links (or menu toggle) Bootstrap would activate                                                           |
| `sections`    | `Readonly<Ref<readonly ScrollspySection[]>>`                        | Spied sections, top to bottom: `{ id, el, link }` ([`ScrollspySection`](/docs/types#scrollspysection))                                           |
| `content`     | `Readonly<Ref<HTMLElement \| null>>`                                | Resolved content element                                                                                                                         |
| `target`      | `Readonly<Ref<HTMLElement \| null>>`                                | Resolved target element                                                                                                                          |
| `scrollTo`    | `(idOrEvent: string \| Event, opts?: { smooth?: boolean }) => void` | Scroll to a section by id, or to the section of a clicked link; then replace the hash and focus the section. `smooth` defaults to `smoothScroll` |
| `refresh`     | `() => void`                                                        | Re-scan the target links and rebuild the observers                                                                                               |
| `dispose`     | `() => void`                                                        | Stop observing and remove the sentinel. Runs automatically when the component (or effect scope) is unmounted                                     |

## Markup

The composable adds one element to the content: an empty, zero-size `<div aria-hidden="true">` at
its end, used to detect that the end of the content was reached (as Bootstrap does). It is moved back
to the end on each refresh and removed by `dispose()`.

## Changes from earlier versions

The composable was rebuilt on the Bootstrap 6 algorithm, and the `v-b-scrollspy` directive was
removed: use `useScrollspy`.

| Before                                                     | Now                                                                                |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `v-b-scrollspy` directive                                  | Removed; call `useScrollspy(content, target)`                                      |
| Sections from `contentQuery` (headings inside the content) | Sections from the target's links; render the navigation first, then spy on it      |
| `contentQuery`, `targetQuery`, `root`, `manual` options    | Removed. The root is the content when it scrolls, otherwise the viewport           |
| Active class written to the links (unless `manual`)        | Nothing is written; bind `:active` and `aria-current` from `current` / `activeIds` |
| `rootMargin: '0px 0px -25%'`, `threshold: [0.1, 0.5, 1]`   | `topMargin: '12%'`, `rootMargin: null`, `threshold: [0]`                           |
| `list` (`{ id, el, visible, text }`)                       | `sections` (`{ id, el, link }`); `visible` and `text` are gone                     |
| `scrollIntoView(event)`                                    | `scrollTo(idOrEvent, { smooth })`                                                  |
| `updateList()` / `cleanup()`                               | `refresh()` / `dispose()` (runs automatically on unmount)                          |
