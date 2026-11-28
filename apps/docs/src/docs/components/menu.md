---
title: Menu
description: 'Menus are toggleable overlays for lists of links, actions and free content, positioned next to their toggle with Floating UI.'
---

`BMenu` renders Bootstrap's Menu: a toggle button and a `.menu` panel next to it. The menu opens on click (or with the arrow keys), not on hover, and is positioned with [Floating UI](https://floating-ui.com/). It replaces the `BDropdown` component of earlier versions.

<<< DEMO ./demo/MenuOverview.vue#template{vue-html}

The component has no wrapper element: it renders the toggle and the `.menu` as siblings, exactly like Bootstrap's markup. Attributes that are not props (`class`, `style`, `aria-*`, listeners) go to the toggle, and `toggle-attrs` / `menu-attrs` target each part. There is no caret on the toggle; add an icon in the `toggle` slot if you want one.

## Toggle content

Use the `text` prop for plain text, or the `toggle` slot for icons and markup.

<<< DEMO ./demo/MenuToggleContent.vue#template{vue-html}

## Items

`BMenuItem` renders a `<button type="button" class="menu-item">`, or a link when `href` or `to` is set (it takes every [`BLink`](/docs/components/link) prop). Use `active` for the current item (it adds `aria-current="true"`), `disabled` for unavailable ones, and `color` (`{ theme }`) to theme an item.

<<< DEMO ./demo/MenuItems.vue#template{vue-html}

Clicking an item emits `click` and closes the menu, unless `auto-close` is `false` or `'outside'`.

### Icons

Put an icon with the `menu-item-icon` class in the item's `icon` slot.

<<< DEMO ./demo/MenuIcons.vue#template{vue-html}

### Descriptions

The `description` prop (or slot) adds secondary text below the content.

<<< DEMO ./demo/MenuDescriptions.vue#template{vue-html}

### Selected

Setting `selected` to a boolean renders a check mark that is visible while it is `true`. Use it for single or multiple choice menus; leave it unset on items that are never selectable.

<<< DEMO ./demo/MenuSelected.vue

## Headers and dividers

`BMenuHeader` labels a group of items (an `<h6>` by default, see the `tag` prop) and `BMenuDivider` renders an `<hr class="menu-divider">`. Groups are a header followed by its items; there is no group wrapper.

<<< DEMO ./demo/MenuHeaders.vue#template{vue-html}

## Text

`BMenuText` places free-flowing text in the menu.

<<< DEMO ./demo/MenuText.vue#template{vue-html}

## Forms

Put a [`BForm`](/docs/components/form) in the menu. Clicks on form controls, and on anything inside a form in the menu, never close it. Use `auto-close="outside"` so the submit button keeps the menu open too.

<<< DEMO ./demo/MenuForm.vue#template{vue-html}

## Placement

The `placement` prop takes `top`, `bottom`, `left`, `right`, or the logical `start` and `end`, each optionally with `-start` or `-end` (for example `bottom-end` or `end-start`). `start` and `end` follow the document direction: in `<html dir="rtl">` they swap sides. The default is `bottom-start`.

<<< DEMO ./demo/MenuPlacement.vue#template{vue-html}

When there is no room, the menu flips to the opposite side, then tries the other alignment, using Bootstrap's fallback order; when nothing fits it keeps the requested placement. It is also shifted to stay inside `boundary` (its clipping ancestors by default). The final placement is written to `data-bs-placement` on the menu, which Bootstrap's CSS uses for the opening animation's origin.

### Responsive placement

`responsive-placement` overrides `placement` from a breakpoint up. Resize the window to see this menu move to the side from the `md` breakpoint.

<<< DEMO ./demo/MenuResponsivePlacement.vue#template{vue-html}

### Offset

`offset` is `[skidding, distance]` in pixels (default `[0, 2]`), or a function that receives `{ placement, reference, floating }` and returns it.

<<< DEMO ./demo/MenuOffset.vue#template{vue-html}

### Reference, strategy and static display

- `reference` positions the menu against the toggle (default), the toggle's parent (`'parent'`), an element, or a Floating UI virtual element.
- `strategy="fixed"` uses fixed positioning, which escapes `overflow: hidden` ancestors without moving the menu in the DOM.
- `display="static"` turns positioning off, for menus laid out by their container (for example inside an expanded navbar drawer).
- `floating-config` gives full control: an object merged over the default Floating UI config, or a function that receives the default config and returns the one to use.
- The exposed `update()` method recomputes the position of an open menu.

### Teleporting

The menu renders in place, next to its toggle. `teleport-to` moves it to another element (for example `body`) to escape clipping containers.

::: warning
A teleported menu renders **below** an open native dialog (`BDialog`, drawers): those sit in the browser's top layer, which covers everything outside them. Keep menus inside dialogs in place, and use `strategy="fixed"` if they are clipped.
:::

Server-side rendering: the menu renders hidden and is positioned on the client when it opens. An initially open menu (`v-model` or `visible`) renders with `.show` and moves to its computed position after hydration.

## Split button

With `split`, the main button runs its own action (`split-click`, or `split-href` / `split-to` for links) and a separate toggle opens the menu. The toggle shows a chevron and the visually hidden `toggle-text` (default "Toggle menu"); replace them through the `split-toggle` slot. The `toggle` slot and `text` prop fill the main button.

<<< DEMO ./demo/MenuSplit.vue#template{vue-html}

<<< DEMO ./demo/MenuSplitLink.vue#template{vue-html}

Split mode renders a `.btn-group` around the buttons and the menu. Inside a [`BButtonGroup`](/docs/components/button-group) or [`BInputGroup`](/docs/components/input-group) it renders none, so the buttons join the existing group. To style the group (for example spacing), wrap the menu in a `BButtonGroup` and put the classes there.

`split-variant`, `split-color`, `split-attrs`, `split-button-type` and `split-disabled` apply to the main button; `variant`, `color`, `size` and `toggle-attrs` to the toggle.

<<< DEMO ./demo/MenuSplitVariant.vue#template{vue-html}

## Auto close

By default the menu closes on any click, except on its toggle and on form controls in the menu. `auto-close` changes that:

- `true`: any click closes it (default)
- `'inside'`: only clicks inside the menu
- `'outside'`: only clicks outside the menu
- `false`: only the toggle, <kbd>Esc</kbd> and the methods close it

Moving focus out of the menu with <kbd>Tab</kbd> also closes it (except with `false`). <kbd>Esc</kbd> always closes it.

<<< DEMO ./demo/MenuAutoClose.vue#template{vue-html}

`hide` and `hidden` carry what closed the menu in `event.trigger`: `'click-outside'`, `'click-inside'`, `'item'`, `'esc'`, `'tab'`, `'toggle'`, `'disabled'`, or the value passed to `hide()`.

## Translucent and scrollable

`translucent` gives the menu a translucent background; `scrollable` limits its height so long menus scroll. The maximum height can also be set with the `--bs-menu-max-height` CSS variable.

<<< DEMO ./demo/MenuTranslucentScrollable.vue#template{vue-html}

## Styling the toggle

The toggle is a [`BButton`](/docs/components/button): `variant` (default `solid`), `color` (default `{ theme: 'secondary' }`) and `size` style it, and `toggle-attrs` adds attributes.

<<< DEMO ./demo/MenuColorVariants.vue#template{vue-html}

<<< DEMO ./demo/MenuSizing.vue#template{vue-html}

## Custom toggle

The `activator` slot replaces the toggle (the split toggle in split mode) with your own element. Bind the slot's `props` to it with `v-bind="props"`: they wire the click and keyboard handlers, `id`, `aria-expanded`, `aria-controls` and the `show` class.

<<< DEMO ./demo/MenuActivator.vue#template{vue-html}

## v-model and disabled

`v-model` shows and hides the menu. A `disabled` menu disables its toggle, cannot be opened by `v-model`, `show()` or the keyboard, and closes when it becomes disabled.

<<< DEMO ./demo/MenuModel.vue

## Exposed methods

`show()`, `hide()`, `toggle()` and `update()` are available through a template ref.

<<< DEMO ./demo/MenuMethods.vue

## Lazy

With `lazy`, the menu's content is not rendered until the menu first opens; add `unmount-lazy` to remove it again after it closes. For navigation menus, keep `lazy` off so crawlers can follow the links.

<<< DEMO ./demo/MenuLazy.vue#template{vue-html}

## Accessibility

Menus follow Bootstrap's approach: they are generic disclosure panels, not ARIA menus. The toggle gets `aria-expanded` and `aria-controls` (pointing at the menu's id, `${id}-menu`), and no `menu` / `menuitem` roles are added, because menus often hold content (forms, text) that an ARIA menu cannot contain. Mark the current item with `active` (`aria-current="true"`).

If a menu holds only actions and you want ARIA menu semantics, add the roles yourself:

<<< DEMO ./demo/MenuAriaMenu.vue#template{vue-html}

For registering other elements as triggers (with `v-b-toggle`), see [ARIA Trigger Registration for Component Visibility](/docs/reference/accessibility#aria-trigger-registration-for-component-visibility).

### Keyboard navigation

| Key                                  | Action                                                                                                      |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| <kbd>Down</kbd> / <kbd>Up</kbd>      | On the toggle: open the menu and focus the first / last item. In the menu: next / previous item (no wrap)   |
| <kbd>Home</kbd> / <kbd>End</kbd>     | First / last item                                                                                           |
| <kbd>Esc</kbd>                       | Close the menu and focus the toggle                                                                         |
| <kbd>Tab</kbd> / <kbd>Shift+Tab</kbd> | Move through the menu's controls in order; leaving the menu closes it                                      |
| <kbd>Enter</kbd> / <kbd>Space</kbd>  | Activate the focused item                                                                                   |

Arrow keys keep their native behavior in inputs and text areas. Disabled and hidden items are skipped.

## See also

- [`BNavItemDropdown`](/docs/components/nav#menus) for menus inside `BNav` and `BNavbar`
- [Router Link Support](/docs/reference/router-links) for the router props of `BMenuItem`

## Internationalization

<Internationalization />
