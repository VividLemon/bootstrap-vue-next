---
title: Link
description: "Use BootstrapVue's custom b-link component for generating a standard `<a>` link or `RouterLink`. `BLink` supports the `disabled` state and `click` event propagation."
---

## Links without Router

By defaut links with no options will default to # location.

<<< DEMO ./demo/LinkSimple.vue#template{vue-html}

## Links with Router and External Links

By specifying a value in the `href` prop, a standard link (`<a>`) element will be rendered. To
generate a `<router-link>` instead, specify the route location via the `to` prop.

Router links support various additional props. Refer to the
[Router support](/docs/reference/router-links) reference section for details.

If your app is running under [Nuxt.js](https://nuxtjs.org), the
[`<nuxt-link>`](https://nuxtjs.org/api/components-nuxt-link) component will be used instead of
`<router-link>`. The `<nuxt-link>` component supports all the same features as `<router-link>` (as
it is a wrapper component for `<router-link>`) and more.

<<< DEMO ./demo/LinkExternal.vue#template{vue-html}

## Styling Links

External Links can be specified with the `href` prop.

<<< DEMO ./demo/LinkStyles.vue#template{vue-html}

## Link opacity

Change the alpha opacity of the link `rgba()` color value with the `opacity` prop. It takes a `HoverState` object, `{ xs?: LinkOpacity, hover?: LinkOpacity }`: the `xs` value always applies (`link-*`) and the `hover` value applies on hover (`hover:link-*`). Please be aware that changes to a color’s opacity can lead to links with [insufficient contrast](https://getbootstrap.com/docs/5.3/getting-started/accessibility/#color-contrast).

<<< DEMO ./demo/LinkOpacity.vue

You can even change the opacity level on hover with the `hover` key.

<<< DEMO ./demo/LinkOpacityHover.vue

## Link underlines

### Underline color

Change the underline’s color independent of the link text color with the `underline` prop's `color` key.

<<< DEMO ./demo/LinkUnderlineColors.vue

### Underline offset

Change the underline’s distance from your text with the `underline` prop's `offset` key. Offset is set in `em` units to automatically scale with the element’s current `font-size`.

<<< DEMO ./demo/LinkUnderlineOffsets.vue

### Underline opacity

Change the underline’s opacity with the `underline` prop's `opacity` key.

<<< DEMO ./demo/LinkUnderlineOpacity.vue

### Hover variants

`opacity` and the `underline` prop's `offset` and `opacity` keys take a `HoverState` object: the `xs` key applies the value at all
times (no prefix) and the `hover` key applies it on hover (`hover:` prefix). For example `:opacity="{ xs: 50, hover: 100 }"`
renders `link-50 hover:link-100`. Mix and match to create unique link styles.

<<< DEMO ./demo/LinkHoverVariants.vue#template{vue-html}

## Colored Links

You can use the `color` prop's `theme` key to colorize links (rendered as `.theme-<theme>`, which v6 anchors read through `--theme-fg`). Some of the link styles use a relatively light foreground color, and should only be used on a dark background in order to have sufficient contrast. The `underline` prop's `color` key colors the underline (`.underline-<theme>`). See [registering custom themes](/docs/components/button#custom-themes) to add your own.

<<< DEMO ./demo/LinkColors.vue

## Link disabled state

Disable link functionality by setting the `disabled` prop to true.

<<< DEMO ./demo/LinkDisabled.vue#template{vue-html}

Disabling a link will set the Bootstrap v5 `.disabled` class on the link as well as handles stopping
event propagation, preventing the default action from occurring, and removing the link from the
document tab sequence (`tabindex="-1"`).

::: info NOTE
Bootstrap v5 CSS currently does not style disabled links differently than non-disabled
links. You can use the following custom CSS to style disabled links (by preventing hover style
changes).
:::

<<< FRAGMENT ./demo/LinkDisabled.css
