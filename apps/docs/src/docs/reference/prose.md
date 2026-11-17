---
title: Prose
description: >
  Style rich content such as Markdown or CMS output with Bootstrap's `.prose` and `.not-prose`
  classes. There is no component: add the classes to your own elements.
---

## Overview

Bootstrap v6's `.prose` class gives a block of content readable typography: font size and line
height (larger from 1024px viewport width), a column layout with even spacing, a maximum width of
`1000px`, and styles for headings, lists, `hr`, links and tables without classes, images,
blockquotes and `dt`. It is CSS only, so BootstrapVueNext has no `BProse` component: put the class on
any element.

<<< DEMO ./demo/ProseOverview.vue#template{vue-html}

## Rendered HTML

Prose is meant for content you do not write element by element, such as Markdown rendered to HTML:

```vue-html
<article class="prose" v-html="renderedMarkdown" />
```

Only pass trusted or sanitized HTML to `v-html`.

## Opting out with `.not-prose`

Wrap library components or other markup inside prose content in `.not-prose` so the prose styles do
not change them, for example a `BCard` or a `BTable` inside an article. A `.prose` element inside a
`.not-prose` element does not get the prose styles again.

## Customizing

Override the CSS variables on the `.prose` element:

| Variable                   | Purpose                           |
| -------------------------- | --------------------------------- |
| `--bs-content-font-size`   | Base font size                    |
| `--bs-content-line-height` | Line height                       |
| `--bs-content-gap`         | Space between the direct children |
| `--bs-heading-color`       | Color of the headings             |

```vue-html
<article class="prose" style="--bs-content-gap: 2rem">…</article>
```

See the [Bootstrap prose documentation](https://getbootstrap.com/docs/6.0/content/prose/) for the
full list of styled elements.
