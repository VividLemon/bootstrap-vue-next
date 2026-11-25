---
title: Button Toolbar
description: 'Group a series of button-groups and/or input-groups together on a single line, with support for sizing, justification, and mixing different control types.'
---

**Example 1:** with button groups

<<< DEMO ./demo/ButtonToolbarExample1.vue#template{vue-html}

**Example 2:** with mixture of small button group and small input group.

<<< DEMO ./demo/ButtonToolbarExample2.vue#template{vue-html}

**Example 3:** with button groups and a menu.

<<< DEMO ./demo/ButtonToolbarExample3.vue#template{vue-html}

## Usage

Feel free to mix input groups and menus with button groups in your toolbars. Similar to the
example above, Bootstrap's `.btn-toolbar` already puts a gap between the groups, so no spacing utilities are needed.

## Sizing

Note, if you want smaller or larger buttons or controls, set the `size` prop directly on the
`BButtonGroup`, `BInputGroup`, and `BMenu` components.

<<< DEMO ./demo/ButtonToolbarSizing.vue#template{vue-html}

## Justify

Make the toolbar span the maximum available width, by increasing spacing between the button groups,
input groups and menus, by setting the prop `justify`.

<<< DEMO ./demo/ButtonToolbarJustify.vue#template{vue-html}

## Internationalization

<Internationalization />