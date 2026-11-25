---
title: Button Group
migrationGuide: false
description: 'Group a series of buttons together on a single line or stack them in a vertical column with `BButtonGroup`.'
---

## Overview

Button Groups are an easy way to group a series of buttons together.

<<< DEMO ./demo/ButtonGroupOverview.vue#template{vue-html}

**Note:**
In order for assistive technologies (such as screen readers) to convey that a series of buttons is grouped, an appropriate role attribute needs to be provided. `bootstrap-vue-next` will put the `role="group"` and `aria-role` attributes on the groups. By default, `aria-role` is set to `group`, but you can override that with the `aria-role` property.

In addition, groups should be given an explicit label, as most assistive technologies will otherwise not announce them, despite the presence of the correct role attribute. In the examples provided here, we use `aria-label`, but alternatives such as `aria-labelledby` can also be used.

## Sizing

Set the `size` prop to `lg`, `sm` or `xs` to render larger or smaller buttons. You do not need to specify the size on the individual buttons.

<<< DEMO ./demo/ButtonGroupSizing.vue#template{vue-html}

## Dividers

Set the `divider` prop to draw a line between the buttons of a group. It is most useful for groups of solid buttons with the same color, and it also works with `vertical`.

<<< DEMO ./demo/ButtonGroupDivider.vue#template{vue-html}

## Vertical variation

Make a set of buttons appear vertically stacked rather than horizontally by setting the `vertical`
prop. Split menus are not supported here.

<<< DEMO ./demo/ButtonGroupVertical.vue#template{vue-html}

## Menu support

Add [`BMenu`](/docs/components/menu) menus directly inside your `BButtonGroup`: the toggle and the
menu become children of the group, so the toggle joins the other buttons. Note that split menus are
not supported when prop `vertical` is set.

<<< DEMO ./demo/ButtonGroupMenu.vue#template{vue-html}

## See also

Also check out the [`BButtonToolbar`](/docs/components/button-toolbar) component for generating
toolbars containing button groups and input groups.

## Internationalization

<Internationalization />