---
title: Breadcrumb
description: 'Indicate the current page’s location within a navigational hierarchy using explicit divider elements.'
---

## Overview

<<< DEMO ./demo/BreadcrumbOverview.vue

## Breadcrumb items

Items are rendered using `:items` prop. A `.breadcrumb-divider` element is rendered between items automatically. It can be an array of objects to provide link and active
state or an array of strings. Links can be `href`'s for anchor tags, or `to`'s for router-links.
The active state of last element is automatically set if it is `undefined`.

### Breadcrumb items as array of strings

<<< DEMO ./demo/BreadcrumbAsArray.vue

## Manually placed items

You may also manually place individual `BBreadcrumbItem` child components in the default slot of
the `BBreadcrumb` component, as an alternative to using the `items` prop, for greater control
over the content of each item. Unlike the `items` prop, manually placed items need an explicit
`<BBreadcrumbDivider />` between them:

<<< DEMO ./demo/BreadcrumbManual.vue

Remember to set the `active` prop on the last item. The active item renders `.breadcrumb-link.active`
and its `.breadcrumb-item` receives `aria-current="page"` (configurable via the `aria-current` prop).

`BBreadcrumbItem` also supports the various `RouterLink` props such as `to`, etc. See the
[Router Links](/docs/reference/router-links) refererence page for more information.

## Dividers

A divider is an `<li class="breadcrumb-divider">` between two items. It is decoration, so it is rendered with `aria-hidden="true"`. An empty divider shows Bootstrap's default chevron; give it content (such as `/` or an icon) for a custom separator:

- with the `items` prop, fill the `divider` slot of `BBreadcrumb`; it is rendered in every divider
- between manually placed items, put the content in `BBreadcrumbDivider`

<<< DEMO ./demo/BreadcrumbDivider.vue#template{vue-html}

To change the default chevron everywhere, set the `--bs-breadcrumb-divider-icon` CSS variable.

## Slots

Two slots are provided to put additional content before and after the breadcrumb.
Use slot `prepend` to put content before the breadcrumb. Use slot `append` to put content after the breadcrumb.

<<< DEMO ./demo/BreadcrumbSlots.vue#template{vue-html}
