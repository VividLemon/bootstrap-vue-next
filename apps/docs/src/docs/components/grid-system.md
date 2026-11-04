---
title: Grid System
migrationGuide: 'grid'
description: >
  Use the powerful mobile-first flexbox grid (via the `<BContainer>`, `<BRow>` and
  `<BCol>` components) to build layouts of all shapes and sizes thanks to a twelve column system,
  five default responsive tiers, CSS Sass variables and mixins, and dozens of predefined classes.
---

## Overview

Bootstrap's grid system uses a series of containers, rows, and columns to layout and align content. It's built with [flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox) and is fully responsive. Below is an example and an in-depth look at how the grid comes together.

<<< DEMO ./demo/GridOverview.vue#template{vue-html}

The above example creates three equal-width columns across all devices and viewports using our predefined grid classes. Those columns are centered in the page with the parent `<BContainer>`.

::: tip
New to or unfamiliar with flexbox? [Read this CSS Tricks flexbox guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/#flexbox-background) for background, terminology, guidelines, and code snippets.
:::

## How it works

Breaking it down, here's how it works:

- Containers provide a means to center and horizontally pad your site's contents. Use
  `<BContainer>` for a responsive pixel width, `<BContainer fluid>` for `width: 100%` across all
  viewport and device sizes or set `fluid` to a [`Breakpoint`](/docs/types#breakpoint) value for a
  responsive container (e.g. `<BContainer fluid="md">`).
- Rows are wrappers for columns. Each column has horizontal `padding` (called a gutter) for
  controlling the space between them. This `padding` is then counteracted on the rows with negative
  margins. This way, all the content in your columns is visually aligned down the left side.
- In a grid layout, content must be placed within columns and only columns may be immediate children
  of rows.
- Thanks to flexbox, grid columns without a set width will automatically layout with equal widths.
  For example, four instances of `<BCol :cols="{ sm: true }">` will each automatically be 25% wide
  from the small breakpoint up.
- The column props `cols`, `offset`, `order` and `align-self` take a
  [responsive object](/docs/types#responsive) keyed by breakpoint: `xs`, `sm`, `md`, `lg`, `xl` and
  `2xl`. Each key renders a Bootstrap v6 prefix class, and `xs` renders the class without a prefix.
  For example `<BCol :cols="{ xs: 12, md: 6, '2xl': 4 }">` renders `col-12 md:col-6 2xl:col-4`.
- `cols` values indicate the number of columns you'd like to use out of the possible 12 per row. So,
  if you want three equal-width columns at any breakpoint, you can use `<BCol :cols="{ xs: 4 }">`.
  The value `true` renders an equal-width column for that breakpoint (`{ md: true }` renders
  `md:col`), and the special value `'auto'` sizes the column to its content.
- Column `width`s are set in percentages, so they're always fluid and sized relative to their parent
  element.
- Columns have horizontal `padding` to create the gutters between individual columns, however, you
  can remove the `margin` from `<BRow>` and `padding` from `<BCol>` by setting the `no-gutters`
  prop on `<BRow>`.
- To make the grid responsive, there are six grid tiers, one for each responsive breakpoint:
  all breakpoints (extra small), small, medium, large, extra large, and 2x extra large.
- Grid breakpoints are based on minimum width media queries, meaning **they apply to that one
  breakpoint and all those above it** (e.g., `<BCol :cols="{ sm: 4 }">` applies to small, medium,
  large, extra large and 2x extra large devices, but not the first `xs` breakpoint).
- You can use predefined grid classes or Sass mixins for more semantic markup. See the
  [Bootstrap 6 docs](https://getbootstrap.com/docs/6.0/layout/grid/) for details

Be aware of the limitations and [bugs around flexbox](https://github.com/philipwalton/flexbugs),
like the
[inability to use some HTML elements as flex containers](https://github.com/philipwalton/flexbugs#flexbug-9).

## Containers

`<BContainer>` is the most basic layout element in Bootstrap. Choose from a
responsive, fixed-width container (meaning its `max-width` changes at each breakpoint) by default,
fluid-width (meaning it's 100% wide all the time) by setting 'fluid' prop, or responsive
containers where the container is fluid up until a specific breakpoint.

While containers can be nested, most layouts do not require a nested container.

The default breakpoint widths can be configured using Bootstrap v6 Sass variables. See the
[Grid options](#grid-options) section below.

### Default container

The default `<BContainer>` is a responsive, fixed-width container, meaning its `max-width` changes
at each viewport width breakpoint.

<<< FRAGMENT ./demo/ContainerDefault.vue#template{vue-html}

### Fluid width container

Using the `fluid` prop on `<BContainer>` will render a container that is always 100% width,
regardless of viewport breakpoint.

<<< FRAGMENT ./demo/ContainerFluid.vue#template{vue-html}

Setting the `fluid` prop to true (or an empty string) is equivalent to the Bootstrap
`.container-fluid` class.

### Responsive fluid containers

Responsive containers allow you to specify a container that is 100%
wide (fluid) until particular breakpoint is reached at which point a `max-width` is applied. For
example, setting prop `fluid` to `'md'` will render a container that is 100% wide to start until the
`'md'` breakpoint is reached, at which point it will become a standard non-fluid container.

<<< FRAGMENT ./demo/ContainerResponsive.vue#template{vue-html}

Setting the fluid prop to a breakpoint name translates to the Bootstrap v6 class
`.{breakpoint}:container` (for example `fluid="md"` renders `md:container`).

Refer to the [Grid options section](#grid-options) table below for the default container width
values.

## Rows

Rows are wrappers for [columns](#columns). Each column has horizontal padding (called a
gutter) for controlling the space between them. This padding is then counteracted on the rows with
negative margins. This way, all the content in your columns is visually aligned down the left side.

You can remove the margin from `<BRow>` and padding from `<BCol>` by setting the `no-gutters` prop
on `<BRow>`.

::: info
`<BFormRow>` is deprecated, see our [migration knowledge base](/docs/migration-data/components/bform) for details.
:::

## Columns

`<BCol>` Must be placed inside a `<BRow>` component, or an element (such as a `<div>`) that has
the class `row` applied to it.

## Grid options

While Bootstrap uses `em` or `rem` units for defining most sizes, `px`s are used for grid
breakpoints and container widths. This is because the viewport width is in pixels and does not
change with the [font size](https://drafts.csswg.org/mediaqueries-3/#units).

See how aspects of the Bootstrap grid system work across multiple devices with a handy table.

<div class="sm:table-responsive">
  <table class="table table-bordered table-striped">
    <thead>
      <tr>
        <th></th>
        <th>
          <strong>Extra small</strong> (xs)<br>
          <code>&lt;576px</code>
        </th>
        <th>
          <strong>Small</strong> (sm)<br>
          <code>≥576px</code>
        </th>
        <th>
          <strong>Medium</strong> (md)<br>
          <code>≥768px</code>
        </th>
        <th>
          <strong>Large</strong> (lg)<br>
          <code>≥1024px</code>
        </th>
        <th>
          <strong>Extra large</strong> (xl)<br>
          <code>≥1280px</code>
        </th>
        <th>
          <strong>2x extra large</strong> (2xl)<br>
          <code>≥1536px</code>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th class="text-start">Max container width</th>
        <td>None (auto)</td>
        <td>540px</td>
        <td>720px</td>
        <td>960px</td>
        <td>1200px</td>
        <td>1440px</td>
      </tr>
      <tr>
        <th class="text-start">Responsive key</th>
        <td><code>xs</code></td>
        <td><code>sm</code></td>
        <td><code>md</code></td>
        <td><code>lg</code></td>
        <td><code>xl</code></td>
        <td><code>'2xl'</code></td>
      </tr>
      <tr>
        <th class="text-start">Class prefix</th>
        <td>None (<code>col-6</code>)</td>
        <td><code>sm:</code></td>
        <td><code>md:</code></td>
        <td><code>lg:</code></td>
        <td><code>xl:</code></td>
        <td><code>2xl:</code></td>
      </tr>
      <tr>
        <th class="text-start"># of columns</th>
        <td colspan="6">12</td>
      </tr>
      <tr>
        <th class="text-start">Gutter width</th>
        <td colspan="6">1.5rem (.75rem on each side of a column)</td>
      </tr>
      <tr>
        <th class="text-start">Nestable</th>
        <td colspan="6">Yes</td>
      </tr>
      <tr>
        <th class="text-start">Column props</th>
        <td colspan="6"><code>cols</code>, <code>offset</code>, <code>order</code>, <code>align-self</code></td>
      </tr>
    </tbody>
  </table>
</div>

**Notes:**

- Every responsive prop takes an object, for example `:cols="{ xs: 12, md: 6, '2xl': 4 }"`. The
  `2xl` key must be quoted because it starts with a digit.
- The above breakpoint values are Bootstrap v6 defaults. They can be customized via
  [Sass variables](https://getbootstrap.com/docs/6.0/layout/grid/#customizing-the-grid).

### Container sizes

The following table outlines the default container maximum widths at the various breakpoints. These
may vary if you are using custom themed Bootstrap v6 Sass/CSS.

| Container type | Extra small `<576px` | Small `≥576px` | Medium `≥768px` | Large `≥1024px` | Extra large `≥1280px` | 2x extra large `≥1536px` |
| -------------- | -------------------- | -------------- | --------------- | --------------- | --------------------- | ------------------------ |
| _default_      | `100%`               | `540px`        | `720px`         | `960px`         | `1200px`              | `1440px`                 |
| `fluid`        | `100%`               | `100%`         | `100%`          | `100%`          | `100%`                | `100%`                   |
| `fluid="sm"`   | `100%`               | `540px`        | `720px`         | `960px`         | `1200px`              | `1440px`                 |
| `fluid="md"`   | `100%`               | `100%`         | `720px`         | `960px`         | `1200px`              | `1440px`                 |
| `fluid="lg"`   | `100%`               | `100%`         | `100%`          | `960px`         | `1200px`              | `1440px`                 |
| `fluid="xl"`   | `100%`               | `100%`         | `100%`          | `100%`          | `1200px`              | `1440px`                 |
| `fluid="2xl"`  | `100%`               | `100%`         | `100%`          | `100%`          | `100%`                | `1440px`                 |

Refer to the [Containers section](#containers) section above for additional information

## Auto-layout columns

Utilize breakpoint-specific column classes for easy column sizing without an explicit number, for
example `<BCol :cols="{ sm: true }">` (renders `sm:col`).

### Equal-width columns

For example, here are two grid layouts that apply to every device and viewport, from `xs` to `2xl`.
Add any number of unit-less classes for each breakpoint you need and every column will be the same
width.

<<< DEMO ./demo/ColEqualWidth.vue#template{vue-html}

### Equal-width multi-line

Create equal-width columns that span multiple lines by inserting a `.w-100` where you want the
columns to break to a new line. Make the breaks responsive by mixing `.w-100` with some
[responsive display utilities](https://getbootstrap.com/docs/6.0/utilities/display/).

There was a [Safari flexbox bug](https://github.com/philipwalton/flexbugs#flexbug-11) that prevented
this from working without an explicit `flex-basis` or `border`. There are workarounds for older
browser versions, but they shouldn't be necessary if your target browsers don't fall into the buggy
versions.

<<< DEMO ./demo/ColEqualMultiline.vue#template{vue-html}

### Setting one column width

Auto-layout for flexbox grid columns also means you can set the width of one column and have the
sibling columns automatically resize around it. You may use predefined grid classes (as shown
below), grid mixins, or inline widths. Note that the other columns will resize no matter the width
of the center column.

<<< DEMO ./demo/ColOneWidth.vue#template{vue-html}

### Variable width content

Use `'auto'` values (for example `:cols="{ md: 'auto' }"`, rendering `md:col-auto`) to size columns
based on the natural width of their content. A responsive `align-h` on `<BRow>` (here
`:align-h="{ md: 'center' }"`) centers the columns from the given breakpoint up.

<<< DEMO ./demo/ColVariableWidth.vue#template{vue-html}

## Responsive classes

Bootstrap's grid includes six tiers of predefined classes for building complex responsive layouts.
Customize the size of your columns on extra small, small, medium, large, extra large, or 2x extra
large devices however you see fit.

### All breakpoints

For grids that are the same from the smallest of devices to the largest, use the `xs` key of the
`cols` prop (`:cols="{ xs: 8 }"` renders `col-8`). Specify a number when you need a particularly sized
column; otherwise, leave `cols` unset and the column renders the equal-width `.col` class. `.col`
is only added when no breakpoint sets a column size, so `:cols="{ md: 6 }"` renders just `md:col-6`.

<<< DEMO ./demo/ColBreakpoints.vue#template{vue-html}

### Stacked to horizontal

Using a single `sm` key (`:cols="{ sm: 8 }"`, or `:cols="{ sm: true }"` for equal width from `sm`
up), you can create a basic grid system that starts out stacked on extra small devices before
becoming horizontal on larger devices.

<<< DEMO ./demo/ColStackedToHorizontal.vue#template{vue-html}

### Mix and match

Don't want your columns to simply stack in some grid tiers? Use a combination of different keys for
each tier as needed. See the example below for a better idea of how it all works.

<<< DEMO ./demo/ColMixed.vue#template{vue-html}

## Alignment

Use flexbox alignment utilities to vertically and horizontally align columns.

**Note:** Internet Explorer 11 does not support vertical alignment of flex items when the flex
container has a `min-height` as shown below.
[See Flexbugs #3 for more details](https://github.com/philipwalton/flexbugs#flexbug-3).

### Vertical alignment

For vertical alignment of all grid cells in a row, use the `align-v` prop on `<BRow>`. Possible
values are `'start'`, `'center'`, `'end'`, `'baseline'`, and `'stretch'` from
[`AlignmentVertical`](/docs/types#alignment). Like every grid alignment prop it takes a responsive
object, so `:align-v="{ xs: 'start', md: 'center' }"` renders `align-items-start md:align-items-center`:

<<< DEMO ./demo/ContainerVerticalAlignment.vue#template{vue-html}

For individual grid cell vertical alignment, use the `align-self` prop on `<BCol>`. Possible values
are the values [`AlignmentVertical`](/docs/types#alignment) and `auto`
(`:align-self="{ md: 'end' }"` renders `md:align-self-end`):

<<< DEMO ./demo/ContainerCellAlignment.vue#template{vue-html}

### Horizontal alignment

To horizontally align grid cells within a row, use the `align-h` prop on `<BRow>`. Possible values
are: `'start'`, `'center'`, `'end'`, `'around'`, `'between'` and `'evenly'` from
[`AlignmentJustifyContent`](/docs/types#alignment) (`:align-h="{ lg: 'between' }"` renders
`lg:justify-content-between`). Use the `align-content` prop on `<BRow>` to align multi-line rows on
the cross axis:

<<< DEMO ./demo/ContainerHorizontalAlignment.vue#template{vue-html}

## Reordering

### Ordering columns

Use the `order` prop for controlling the visual order of your content. It is responsive, so you can
set the order by breakpoint (e.g., `:order="{ xs: 1, md: 2 }"` renders `order-1 md:order-2`). Includes
support for `0` through `5`, `'first'` and `'last'` across all six grid tiers. Flex items default to
an order value of `0`.

<<< DEMO ./demo/ColOrder.vue#template{vue-html}

Ordering is controlled by flexbox's CSS style `order`.

### Offsetting columns

You can offset grid columns in two ways: our responsive `offset` prop or the
[spacing](https://getbootstrap.com/docs/6.0/utilities/spacing/)
utility classes. Grid offsets are sized to match columns (`:offset="{ md: 4 }"` renders
`md:offset-4`, from `0` to `11`) while margin utility classes are more useful for quick layouts
where the width of the offset is variable.

<<< DEMO ./demo/ColOffset.vue#template{vue-html}

In addition to column clearing at responsive breakpoints, you may need to reset offsets by setting
the offset to `0` at a larger breakpoint:

<<< DEMO ./demo/ColOffsetClear.vue#template{vue-html}

### Margin utilities on columns

You can use [margin and spacing](https://getbootstrap.com/docs/6.0/utilities/spacing/) utility classes
like `.me-auto` (or the responsive `.md:ms-auto`) to force sibling columns away from one another.

<<< DEMO ./demo/ColSpacing.vue#template{vue-html}

## Nesting grids

To nest your content with the default grid, add a new `<BRow>` and set of `<BCol>` components
within an existing `<BCol>` component. Nested rows should include a set of columns that add up to
12 or fewer (it is not required that you use all 12 available columns).

<<< DEMO ./demo/ColNesting.vue#template{vue-html}

## Row columns

Use the responsive `cols` prop on `<BRow>` to quickly set the number of columns that best render
your content and layout. Whereas normal column widths apply to the individual `<BCol>` columns
(e.g., `<BCol :cols="{ md: 4 }">`), the row columns `cols` prop is set on the parent `<BRow>` as a
shortcut.

Use these row columns to quickly create basic grid layouts or to control your card layouts. The
maximum number of row columns in Bootstrap v6 is `6` (unlike the regular columns which have a
maximum of `12` columns), and `'auto'` gives each column its natural width.

The value specified in the `<BRow>` prop is the number of columns to create per row (whereas the
`cols` prop on `<BCol>` refers to the number of columns to occupy).

<<< DEMO ./demo/RowCol.vue#template{vue-html}

You can control the number of columns at each breakpoint level via the keys of the `cols` object
(`xs`, `sm`, `md`, `lg`, `xl` and `'2xl'`). For example `:cols="{ xs: 1, sm: 2, md: 4, lg: 6 }"`
renders `row-cols-1 sm:row-cols-2 md:row-cols-4 lg:row-cols-6`:

<<< DEMO ./demo/RowColResponsive.vue#template{vue-html}

## Gutters

Gutters are the padding between your columns. Set them with the `gutter-x` and `gutter-y` props on
`<BRow>` or `<BContainer>`. Both take a responsive object whose values (`0` to `12`) are passed
straight through to the Bootstrap v6 spacing scale, so `:gutter-x="{ xs: 3, md: 7 }"` renders
`gx-3 md:gx-7` (`0.5rem`, then `1.5rem` from `md` up). Note that the v6 spacing scale has more steps
than v5: the default `1.5rem` gutter is step `7`.

```vue-html
<BRow :gutter-x="{ xs: 3, md: 7 }" :gutter-y="{ xs: 3 }">
  <BCol>…</BCol>
  <BCol>…</BCol>
</BRow>
```

Use the `no-gutters` prop on `<BRow>` to remove the gutters entirely (`g-0`).

## Utilities for layout

For faster mobile-friendly and responsive development, Bootstrap includes dozens of
[utility classes](/docs/reference/utility-classes) for showing, hiding, aligning, and spacing
content.

### Changing `display`

Use Bootstrap's [display utilities](https://getbootstrap.com/docs/6.0/utilities/display/)
for responsively toggling common values of the `display` property. Mix it with the grid system,
content, or components to show or hide them across specific viewports.

### Flexbox options

Bootstrap 6 is built with flexbox, but not every element’s `display` has been changed to
`display: flex` as this would add many unnecessary overrides and unexpectedly change key browser
behaviors. Most of the components are built with flexbox enabled.

Should you need to add `display: flex` to an element, do so with `.d-flex` or one of the responsive
variants (e.g., `.sm:d-flex`). You’ll need this class or `display` value to allow the use of the
extra [flexbox utilities](https://getbootstrap.com/docs/6.0/utilities/flex/)
for sizing, alignment, spacing, and more.

### Margin and padding

Use the `margin` and `padding` [spacing utilities](https://getbootstrap.com/docs/6.0/utilities/spacing/)
to control how elements and components are spaced and sized. Bootstrap 6 includes a twelve-step
scale for spacing utilities. Choose values for all viewports (e.g., `.me-5` for `margin-inline-end: 1rem`),
or pick responsive variants to target specific viewports (e.g., `.md:me-5` for
`margin-inline-end: 1rem` starting at the `md` breakpoint).

### Toggle `visibility`

When toggling `display` isn’t needed, you can toggle the `visibility` of an element with the
[visibility utility classes](https://getbootstrap.com/docs/6.0/utilities/visibility/).
Invisible elements will still affect the layout of the page, but are visually hidden from visitors.

<style lang="scss">
  .bv-example-row {
  .row {
    + .row {
      margin-top: 1rem;
    }

    > .col:not(.header),
    > [class^="col-"],
    > [class*=":col"] {
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
      background-color: rgba(86, 61, 124, 0.15);
      border: 1px solid rgba(86, 61, 124, 0.2);
    }
  }
}

.bv-example-row-flex-cols {
  .row {
    min-height: 10rem;
    background-color: rgba(255, 0, 0, 0.1);
  }
}
</style>
