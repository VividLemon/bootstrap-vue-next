---
title: Nav
description: >
  Navigation available in Bootstrap share general markup and styles, from the base `<BNav>` class
  to the `active` and `disabled` states. Swap modifier props to switch between each style.
---

<<< DEMO ./demo/NavOverview.vue#template{vue-html}

## Overview

The base `<BNav>` component is built with flexbox and provides a strong foundation for building all
types of navigation components. It includes some style overrides (for working with lists), some link
padding for larger hit areas, and basic disabled styling. No active states are included in the base
nav.

`<BNav>` supports the following child components:

- `<BNavItem>` for actionable links (or router-links)
- `<BNavItemDropdown>` for menus
- `<BNavText>` for plain text content
- `<BNavForm>` for inline forms

## Link appearance

Two style variations are supported: `tabs` and `pills`, which support `active` state styling. These
variants are mutually exclusive - use only one style or the other.

### Tab style

Make the nav look like tabs by setting the `tabs` prop.

<<< DEMO ./demo/NavTab.vue#template{vue-html}

### Pill style

Use the pill style by setting the `pills` prop.

<<< DEMO ./demo/NavPill.vue#template{vue-html}

### Small

Make the nav smaller by setting the `small` prop.

<<< DEMO ./demo/NavSmall.vue#template{vue-html}

## Fill and justify

Force your `<BNav>` content to extend the full available width.

### Fill

To proportionately fill all available space with your `<BNavItem>` components, set the `fill`
prop. Notice that all horizontal space is occupied, but not every nav item has the same width.

<<< DEMO ./demo/NavFill.vue#template{vue-html}

### Justified

For equal-width elements, set the `justified` prop instead. All horizontal space will be occupied by
nav links, but unlike `fill` above, every `<BNavItem>` will be the same width.

<<< DEMO ./demo/NavJustified.vue#template{vue-html}

## Alignment

To align your `<BNavItem>` components, use the `align` prop. Available values are those from
[`AlignmentJustifyContent`](/docs/types#alignment): `start`, `center`, `end`, `between`, `around`, and `evenly`.

<<< DEMO ./demo/NavAlignment.vue#template{vue-html}

## Vertical variation

By default `<BNav>` appear on a horizontal line. Stack your navigation by setting the `vertical`
prop.

<<< DEMO ./demo/NavVertical.vue#template{vue-html}

Vertical pills render Bootstrap v6's `nav-pills-vertical` class instead of `flex-column`, which
also stretches each item to the full width of the nav:

<<< DEMO ./demo/NavVerticalPills.vue#template{vue-html}

## Menus

Use `<BNavItemDropdown>` to place a [menu](/docs/components/menu) in your nav. It renders an
`li.nav-item` with a `button.nav-link` toggle and the `.menu`, and takes the
[`BMenu`](/docs/components/menu) props (`placement`, `auto-close`, `lazy`, ...), slots and exposed
methods. The `li` gets `.show` while the menu is open.

<<< DEMO ./demo/NavDropdown.vue#template{vue-html}

Add your own attributes or classes to the toggle with `toggle-attrs` (or as plain attributes),
which renders HTML similar to:

<<< FRAGMENT ./demo/NavDropdown.html#template

Use [`BMenuItem`, `BMenuHeader`, `BMenuText` and `BMenuDivider`](/docs/components/menu) inside it.
The default slot is scoped with `id`, `visible`, `show()`, `hide()` and `toggle()`, and the `toggle`
slot replaces the toggle's text.

::: info
`BNavItemDropdown` is an interim component: it will be replaced by `BNavItemMenu`.
:::

## Nav text content

Use the `<BNavText>` child component to place plain text content into the nav:

<<< DEMO ./demo/NavText.vue#template{vue-html}

## Nav inline forms

Use the `<BNavForm>` child component to place an _inline_ form into the nav:

<<< DEMO ./demo/NavInlineForm.vue

Refer to the [`<BForm>` inline](/docs/components/form#inline-form) documentation for additional
details on placing form controls.

## Tabbed local content support

See the [`<BTabs>`](/docs/components/tabs) component for creating tabbable panes of local content
(not suited for navigation).

## Card integration

Use a `<BNav>` in a [`<BCard>`](/docs/components/card) header, by enabling the `card-header` prop
on `<BNav>` and setting either the `pills` or `tabs` props. With `tabs` it adds the
`card-header-tabs` class; Bootstrap v6 has no `card-header-pills` class, so pills inside a card
header render with their regular styling:

**Tabs style:**

<<< DEMO ./demo/NavTabCard.vue#template{vue-html}

**Pill style:**

<<< DEMO ./demo/NavPillCard.vue#template{vue-html}

**Plain style:**

The `card-header` prop is only needed when you are applying `tabs` style. Note that Bootstrap
does not have special card header styling for plain style nav items.

<<< DEMO ./demo/NavPlainCard.vue#template{vue-html}

The `card-header` prop has no styling effect if the `<BNav>` is in `vertical` mode.

### Using with Vue Router

Have your card `<BNav>` control vue router nested routes via `<RouterView>` or `<NuxtPage>`
components, to create tabbed content that changes with route URL:

<<< FRAGMENT ./demo/NavRouter.vue#template{vue-html}

::: info
Vue Router does not support defining active routes with hashes (`#`), which is why you must
define the "tab" content as child routes.
:::

**Example router config for above:**

<!-- eslint-disable no-unused-vars, no-undef -->

<<< FRAGMENT ./demo/NavRouter.js

One can also use Vue Router
[named routes](https://router.vuejs.org/guide/essentials/named-routes.html#named-routes) and/or
route params instead of path based routes.

For more details see:

- [Vue Router `<RouterView>`](https://router.vuejs.org/api/#router-view)
- [Nuxt `<NuxtPage>`](https://nuxt.com/docs/api/components/nuxt-page)

## Internationalization

<Internationalization />