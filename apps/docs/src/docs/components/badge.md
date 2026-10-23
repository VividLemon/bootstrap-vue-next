---
title: Badge
description: 'Documentation and examples for badges, our small count and labeling component.'
---

## Examples

Badges are static display components that scale to match the size of the immediate parent element by using relative font sizing and `em` units.

### Headings

<<< DEMO ./demo/BadgeHeadings.vue#template{vue-html}

### Buttons

Badges can be used as part of links or buttons to provide a counter.

<<< DEMO ./demo/BadgeButtons.vue#template{vue-html}
Note that depending on how they are used, badges may be confusing for users of screen readers and similar assistive technologies. While the styling of badges provides a visual cue as to their purpose, these users will simply be presented with the content of the badge. Depending on the specific situation, these badges may seem like random additional words or numbers at the end of a sentence, link, or button.

Unless the context is clear (as with the “Notifications” example, where it is understood that the “4” is the number of notifications), consider including additional context with a visually hidden piece of additional
text.

### Positioned

Use Bootstrap's position utilities to place a badge relative to a parent [link](/docs/components/link) or [button](/docs/components/button).
Remember to apply `position-relative` to the badge's parent.

<<< DEMO ./demo/BadgePositioned.vue#template{vue-html}

### Dot Indicator

For a generic dot indicator, compose Bootstrap utility classes directly instead of rendering a badge.
Remember to apply `position-relative` to the parent button.

<<< DEMO ./demo/BadgeDotIndicator.vue#template{vue-html}

## Background colors

<<< DEMO ./demo/BadgeBackgroundColors.vue#template{vue-html}
::: tip Conveying meaning to assistive technologies
Using color to add meaning only provides a visual indication, which will not be conveyed to users of assistive technologies – such as screen readers. Ensure that information denoted by the color is either obvious from the content itself (e.g. the visible text), or is included through alternative means, such as additional text hidden with the `.visually-hidden` class.
:::

<div class="mt-2"></div>

::: warning Interactions between Variant props
`BBadge` implements `bg-variant` and `text-variant` to provide finer control of colors, they take
precedence over the `variant` prop. See the
[Color Variant Reference](/docs/reference/color-variants#variant-interactions) for details.
:::

## Pill badges

Use the `rounded-pill` utility class to make badges more rounded with a larger border-radius.
<<< DEMO ./demo/BadgePill.vue#template{vue-html}

## Actionable badges

Quickly provide actionable badges by specifying either the `href` prop (links) or `to` prop (router-links):

<<< DEMO ./demo/BadgeActionable.vue#template{vue-html}
