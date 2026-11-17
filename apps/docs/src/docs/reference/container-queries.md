---
title: Container Queries
description: >
  Some Bootstrap 6 responsive classes react to the width of a query container instead of the
  viewport. Learn which components are affected and how to provide the container.
---

## Overview

Bootstrap 6 uses [CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
for a few responsive classes. A class such as `md:list-group-horizontal` applies when the nearest
**query-container ancestor** is at least `md` wide, not when the viewport is. Everything else,
including all responsive utilities (`md:d-none`, `md:gap-3`, …), `BRow` / `BCol` and the
containers, still uses viewport media queries.

An element cannot query its own size. The container must be an **ancestor** of the element that uses
the responsive class. BootstrapVueNext adds no prop for this: put a container utility class on any
ancestor (`BContainer`, `BCol`, a plain `div`, …).

## Container utilities

| Class              | CSS                           | Notes                                                    |
| ------------------ | ----------------------------- | -------------------------------------------------------- |
| `.contains-inline` | `container-type: inline-size` | Queries the width. The one you usually want              |
| `.contains-size`   | `container-type: size`        | Queries width and height; the element needs a set height |

```vue-html
<div class="contains-inline">
  <BListGroup horizontal="md">
    <BListGroupItem>One</BListGroupItem>
    <BListGroupItem>Two</BListGroupItem>
  </BListGroup>
</div>
```

## Affected components

| Responsive class                     | Query container                                                | Component                                                                        |
| ------------------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `{bp}:g-col-*`, `{bp}:g-start-*`     | The parent `.grid`                                             | `BGridItem` (inside `BGrid`)                                                     |
| `{bp}:table-stacked`                 | The `.table-responsive` wrapper (always rendered when stacked) | `BTable`, `BTableLite`, `BTableSimple` `stacked`                                 |
| `{bp}:list-group-horizontal`         | None: wrap it in `.contains-inline`                            | `BListGroup` `horizontal`                                                        |
| `.card-group` row layout (from `sm`) | None: wrap it in `.contains-inline`                            | `BCardGroup`                                                                     |
| `{bp}:navbar-expand`                 | The nearest query-container **ancestor** of the navbar         | `BNavbar` `toggleable` (until the navbar migration, it still renders v5 classes) |
| `{bp}:hstack`, `{bp}:vstack`         | `.stack-container`                                             | None; use the classes directly                                                   |

Props whose breakpoint values are container queries say so in their reference documentation.

## Custom components

The Sass mixins `set-container()` and `container-breakpoint-up()` / `-down()` / `-between()` /
`-only()` (with an optional container name) let your own styles use the same breakpoints. See the
[Bootstrap container queries documentation](https://getbootstrap.com/docs/6.0/utilities/container-queries/).

There is no JavaScript helper for container breakpoints. If you need one, measure the container with
`useElementSize` from `@vueuse/core` and compare against the
[breakpoint widths](/docs/components/grid-system).
