---
title: Card
description: 'A card is a flexible and extensible content container. It includes options for headers and footers, a wide variety of content, contextual background colors, and powerful display options.'
---

## Overview

Cards are built with as little markup and styles as possible, but still manage to deliver a ton of
control and customization. Built with flexbox, they offer easy alignment and mix well with other
components.

`BCard` has no fixed width to start, so they'll naturally fill the full width of its parent
element. This is easily customized via styles or standard Bootstrap 6 sizing classes.

Change the default `div` root tag to any other HTML element by specifying via the `tag` prop.

<<< DEMO ./demo/CardOverview.vue#template{vue-html}

## Content types

Cards support a wide variety of content, including images, text, list groups, links and more. The
following are examples of what is supported inside a `BCard`.

### Card body

The building block of a `BCard` is the `BCardBody` section which provides a padded section
within a card.

By default, the `BCard` content is automatically placed in a `BCardBody` section:

<<< DEMO ./demo/CardBody.vue#template{vue-html}

Disable the automatic `BCardBody` section (and associated padding) by setting the prop `no-body`
on the `BCard`.

<<< DEMO ./demo/CardNoBody.vue#template{vue-html}

Note that with `no-body` enabled, the content of the `title` and `subtitle` props will not be
rendered.

Use the `BCardBody` sub-component to place your own card body anywhere in a `BCard` component
that has `no-body` set.

#### Titles, text, and links

_Card titles_ are adding via the `title` prop, and _sub titles_ are added via the `subtitle` prop.
The title is rendered using the sub-component `BCardTitle` while the Sub Title is rendered using
the sub-component `BCardSubtitle`.

With sub-component `BCardText`, paragraph text can be added to the card. The last
`BCardText` in the card body will have its bottom margin automatically removed (via CSS). Text
within `BCardText` can also be styled with the standard HTML tags.

Links can be added with a normal `<a>` tag (or `BLink` component). Bootstrap 6 removed `.card-link`;
use flex or gap utilities when you need a row of links.

<<< DEMO ./demo/CardParts.vue#template{vue-html}

### Images

The `BCard` prop `img-src` places an image on the top of the card, and use the `img-alt` prop to
specify a string to be placed in the image's `alt` attribute. The image specified by the `img-src`
prop will be responsive and will adjust its width when the width of the card is changed.

Alternatively you can manually place images inside `BCard` using the sub-component
`BCardImg`. See the kitchen sink example below for usage.

<<< DEMO ./demo/CardImages.vue#template{vue-html}

**Note:** Setting `img-placement` to `start` or `end` adds `.card-row` to the card and uses
`.card-img-start` / `.card-img-end` on the image, as in Bootstrap 6. A `start` image is rendered before the body and an `end` image after it (likewise `top` before and `bottom` after). You may need to apply
additional styles, as images will "stretch" in height if you have content that is taller than your image. Note headers and footers are not supported when images are left or right
aligned. You may find the [Horizontal Card Layout](#horizontal-card-layout) example to be more
flexible when creating a responsive horizontal card.

#### Overlay image

Place the image in the background of the card by setting `img-placement="overlay"`:

<<< DEMO ./demo/CardOverlayImage.vue#template{vue-html}

#### Lazy loaded images

`BCardImgLazy` has been removed in favor of using a standalone prop on BImg. Use prop `lazy` on BImg and it will automatically use the browsers built in lazy-loading features that are supported natively on all major browsers.

### Header and footer

Add an optional header and/or footer within a card via the `header`/`footer` props or named slots.
You can control the wrapper element tags used by setting the `header-tag` and `footer-tag` props
(both default is `div`).

<<< DEMO ./demo/CardHeaderFooter.vue#template{vue-html}

### Kitchen sink example

Mix and match multiple content types to create the card you need, or throw everything in there.
Shown below are image styles, blocks, text styles, and a list group—all wrapped in a fixed-width
card.

<<< DEMO ./demo/CardKitchenSink.vue#template{vue-html}

## Horizontal card layout

Bootstrap's `.card-row` lays a card out horizontally. With individual card sub-components you
control the parts yourself.

In the example below, `class="card-row"` on a `no-body` `BCard` puts the image and the body side by
side. `placement="start"` on `BCardImg` renders `.card-img-start`, which rounds the image's outer
corners to match the card, and the `w-50` and `object-fit-cover` utilities size it. Further
adjustments may be needed depending on your card content.

<<< DEMO ./demo/CardHorizontal.vue#template{vue-html}

## Foreground colors

Cards read their colors from Bootstrap v6's theme variables. Set the `color` prop's `theme` key (class `.theme-<theme>`) to color the whole card, or use its `fg` key (for example `:color="{ fg: 'white' }"` or `{ fg: 'contrast-primary' }`) to change the color of text within, as well as that of the card's sub-components.

<<< DEMO ./demo/CardTextVariants.vue#template{vue-html}

## Theme, background and border colors

Cards include their own style for quickly changing the background color and border of a card via
the `color` prop's `theme`, `bg` and `border` keys. Solid backgrounds may require setting the
`fg` key to adjust the text color. `bg` accepts values like `primary`, `subtle-primary`, `muted-primary` or a neutral layer such as `1`; `border` accepts values like `primary`, `subtle-primary` or `muted`.
See [Color Themes](/docs/reference/color-variants) for all values and
[registering custom themes](/docs/components/button#custom-themes).

### Subtle and translucent

Set `subtle` to tint the card's borders, header and footer with its theme instead of filling the whole card, and `translucent` for a semi-transparent card with a blurred backdrop.

<<< DEMO ./demo/CardSubtleTranslucent.vue#template{vue-html}

### Solid

<<< DEMO ./demo/CardSolidVariants.vue#template{vue-html}

### Bordered

<<< DEMO ./demo/CardBorderedVariants.vue#template{vue-html}

#### Value to class mapping

bootstrap-vue-next `BCard` `color` keys are directly mapped to Bootstrap v6 classes: `theme` to
`theme-<theme>`, `bg` to `bg-<value>`, `fg` to `fg-<value>` and `border` to `border-<value>`.

### Header and footer colors

You can also apply the theme, background, border and foreground colors individually to card headers and footers via the
`header-theme`, `header-bg`, `header-border`, `header-fg`, `footer-theme`, `footer-bg`,
`footer-border`, and `footer-fg` props.

<<< DEMO ./demo/CardHeaderFooterVariants.vue#template{vue-html}

### Conveying meaning to assistive technologies

Using color to add meaning only provides a visual indication, which will not be conveyed to users of
assistive technologies – such as screen readers. Ensure that information denoted by the color is
either obvious from the content itself (e.g. the visible text), or is included through alternative
means, such as additional text hidden with the `.visually-hidden` class.

## Hover lift

Set `hover-lift` to lift the card and deepen its shadow on hover, and on keyboard focus when the card
itself is focusable (for example `tag="a"`). It renders Bootstrap's `.hover-lift` helper, so the
`--bs-hover-lift-*` CSS variables tune it and reduced motion turns the movement off. See
[Utility classes](/docs/reference/utility-classes#hover-lift) for using it on other components.

<<< DEMO ./demo/CardHoverLift.vue#template{vue-html}

## Nav integration

Integrate [`BNav`](/docs/components/nav) into card headers easily.

**Using the `header` slot**:

<<< DEMO ./demo/CardNavSlot.vue#template{vue-html}

**Using `BCardHeader` sub-component:**

<<< DEMO ./demo/CardNavComponent.vue#template{vue-html}

For more information on using `BNav` in card headers, refer to the
[Navs documentation](/docs/components/nav).

## Card groups

In addition to styling the content within cards, BootstrapVueNext includes a `BCardGroup` component
for laying out series of cards.

### Default card group

Use card groups to render cards as a single, attached element with equal width and height columns.
Bootstrap 6 card groups use a [container query](/docs/reference/container-queries), so place
`BCardGroup` inside a parent with the `.contains-inline` class or the cards will remain stacked. For grid-style layouts of cards (the
replacement for the removed `deck` and `columns` modes), use `BRow`/`BCol`.

When using card groups with footers, their content will automatically line up.

<<< DEMO ./demo/CardGroup.vue#template{vue-html}
