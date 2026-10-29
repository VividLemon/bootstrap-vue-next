---
title: Button
description: "Use Bootstrap's custom `BButton` component for actions in forms, dialogs, and more. Includes support for a handful of contextual variations, sizes, states, and more."
---

## Overview

BootstrapVueNext's `BButton` component generates either a `<button>` element, `<a>` element, or `RouterLink` component with the styling of a button.

<<< DEMO ./demo/ButtonOverview.vue#template{vue-html}

## Element type

The `BButton` component generally renders a `<button>` element. However, you can also render an
`<a>` element by providing an `href` prop value. You may also generate `vue-router` `RouterLink`
when providing a value for the `to` prop (`vue-router` is required).

<<< DEMO ./demo/ButtonElementType.vue#template{vue-html}

## Type

You can specify the button's type by setting the prop `type` to `'button'`, `'submit'` or `'reset'`.
The default type is `'button'`.

Note the `type` prop has no effect when either `href` or `to` props are set.

## Sizing

Fancy larger or smaller buttons? Specify `lg` or `sm` via the `size` prop.

<<< DEMO ./demo/ButtonSizing.vue#template{vue-html}

## Themes and variants

Bootstrap v6 separates a button's **color** from its **style**:

- The `theme` prop picks the color. It adds the Bootstrap class `.theme-<theme>`. The default is `secondary`.
- The `variant` prop picks the style: `solid` (default), `outline`, `subtle`, `text` or `link`. It adds the class `.btn-<variant>`.
- The `styled` prop independently adds the `.btn-styled` modifier.

For example, `<BButton variant="outline" theme="danger">` renders `class="btn btn-outline theme-danger"`.
See the [Color Themes](/docs/reference/color-variants) page for details.

### Themes

Built-in themes are `primary`, `accent`, `success`, `danger`, `warning`, `info`, `inverse` and `secondary`.
The v5 `light` and `dark` colors no longer exist; use `secondary` or `inverse` instead.

<<< DEMO ./demo/ButtonContextualVariants.vue#template{vue-html}

### Outline variant

In need of a button, but not the hefty background colors they bring? Set `variant="outline"` to
remove all background images and colors on any `BButton`, and keep the `theme` prop for the color.

<<< DEMO ./demo/ButtonOutlineVariants.vue#template{vue-html}

### Link variant

Variant `link` will render a button with the appearance of a link while maintaining the default
padding and size of a button. Combine it with `theme` to color it.

<<< DEMO ./demo/ButtonLinkVariant.vue#template{vue-html}

**Tip:** remove the hover underline from a link variant button by adding the `text-decoration-none` class.

## Colors in other components

Most components share the same color model, which maps onto Bootstrap v6's `.theme-*` classes and
`bg`/`fg`/`border` utilities:

- `theme` (and `*-theme` props such as `header-theme`) takes a theme name and renders `.theme-<theme>`. Components whose Bootstrap styles read the theme variables (alert, badge, card, list-group, progress, table, ...) are colored by this class alone.
- `bg` (and `*-bg`) renders `.bg-<value>`. Values are a theme (`primary`), a subtle or muted theme (`subtle-primary`, `muted-primary`), or a neutral layer (`body`, `1`, `2`, `3`, `4`, `fg`, `white`, `black`, `transparent`).
- `fg` (and `*-fg`) renders `.fg-<value>`. Values are a theme (`danger`), an emphasis or contrast theme (`emphasis-danger`, `contrast-danger`), or a neutral layer (`body`, `1`, `2`, `3`, `4`, `bg`, `white`, `black`, `reset`).
- `border` (and `*-border`) renders `.border-<value>`. Values are a theme (`primary`), a subtle theme (`subtle-primary`), or `bg`, `body`, `muted`, `subtle`, `emphasized`, `white`, `black`.
- Props that style a nested button (`ok-variant`/`ok-theme`, `button-variant`/`button-theme`, `split-variant`/`split-theme`, ...) come in the same variant + theme pairs as `BButton`.

See [Color Themes](/docs/reference/color-variants) for the full list of values.

### Registering custom themes {#custom-themes}

Custom themes work as long as the matching `.theme-<name>` class (and any `bg-`/`fg-`/`border-` utilities you use with it) exists in your CSS.
To make TypeScript accept the new name in `theme` props, augment the `ThemeColors` interface:

```typescript
declare module 'bootstrap-vue-next' {
  interface ThemeColors {
    brand: unknown
  }
}
```

After that, `<BButton theme="brand">`, `<BAlert theme="brand">` and every other `theme` prop accept `brand`.

## Block level buttons

Create responsive stacks of full-width, “block buttons” by wrapping the button(s) in a div and specifying
`d-grid` and `gap-*`. By using CSS utilities instead a boolean property on the button, we have much greater
control over spacing, alignment, and responsive behaviors. See the
[Bootstrap 5](https://getbootstrap.com/docs/5.3/components/buttons/#block-buttons)
documentation for details

<<< DEMO ./demo/ButtonBlockLevel.vue#template{vue-html}

## Pill style

Prefer buttons with a more rounded-pill style? Just set the prop `pill` to true.

<<< DEMO ./demo/ButtonPillStyle.vue#template{vue-html}

This prop adds the Bootstrap v5 utility class `.rounded-pill` on the rendered button.

## Squared style

Prefer buttons with a more square corner style? Just set the prop `squared` to true.

<<< DEMO ./demo/ButtonSquaredStyle.vue#template{vue-html}

The `squared` prop adds the Bootstrap v5 utility class `.rounded-0` on the rendered button. The
`pill` prop takes precedence over the `squared` prop.

## Disabled state

Set the `disabled` prop to disable button default functionality. `disabled` also works with buttons
rendered as `<a>` elements and `RouterLink` (i.e. with the `href` or `to` prop set).

<<< DEMO ./demo/ButtonDisabledState.vue#template{vue-html}

## Pressed state and toggling

Buttons will appear pressed (with a darker background, darker border, and inset shadow) when the
prop `pressed` is set to `true`.

The `pressed` prop can be set to one of three values:

- `true`: Sets the `.active` class and adds the attribute `aria-pressed="true"`.
- `false`: Clears the `.active` class and adds the attribute `aria-pressed="false"`.
- `null`: (default) Neither the class `.active` nor the attribute `aria-pressed` will be set.

To create a button that can be toggled between active and non-active states, use the `v-model` (available in Vue 3.0+) on the `pressed` property by specifying `v-model:pressed`.

<<< DEMO ./demo/ButtonPressedState.vue#template{vue-html}

If using toggle button style for a radio or checkbox style interface, it is best to use the built-in
`button` style support of [`BFormRadioGroup`](/docs/components/form-radio) and
[`BFormCheckboxGroup`](/docs/components/form-checkbox).

## Loading

`BButton` supports several properties to indicate a loading state. When `loading` is true, the
loading state is active, otherwise the normal button is displayed. When loading is active, `loading-text`
is shown along with a spinner. If `loading-fill` is true, the button shows only the spinner and the
`loading-text` is ignored. You can also override the spinner with an arbitrary component by
using the `loading-spinner` slot or the entire content of the button with the `loading` slot.

<<< DEMO ./demo/ButtonLoading.vue#template{vue-html}

## Router link support

Refer to the [`Router support`](/docs/reference/router-links) reference docs for the various
supported `RouterLink` related props.

## Accessibility

When the `href` prop is set to `'#'`, `BButton` will render a link (`<a>`) element with attribute
`role="button"` set and appropriate keydown listeners (<kbd>Enter</kbd> and <kbd>Space</kbd>) so
that the link acts like a native HTML `<button>` for screen reader and keyboard-only users. When
disabled, the `aria-disabled="true"` attribute will be set on the `<a>` element.

When the `href` is set to any other value (~~or the `to` prop is used~~), `role="button"` will not be
added, nor will the keyboard event listeners be enabled.

## Internationalization

<Internationalization />