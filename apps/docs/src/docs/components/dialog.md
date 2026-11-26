---
title: Dialog
description: 'Dialogs are prompts built on the native <dialog> element: modal by default, with a backdrop, focus containment and Escape handling from the browser. They replace the modal of earlier versions.'
---

## Usage

<<< DEMO ./demo/DialogUsage.vue

## Overview

`<BDialog>` renders Bootstrap's Dialog on a native `<dialog>` element:

```html
<dialog class="dialog">
  <div class="dialog-header">…</div>
  <div class="dialog-body">…</div>
  <div class="dialog-footer">…</div>
</dialog>
```

- A modal dialog (the default) is opened with the browser's `showModal()`. It sits in the
  [top layer](https://developer.mozilla.org/en-US/docs/Glossary/Top_layer) above everything else, so
  `z-index`, `overflow` and `transform` of its ancestors do not matter and it does not need to be
  teleported. The browser draws the backdrop (`::backdrop`), keeps focus inside the dialog and
  makes the rest of the page inert.
- The `<dialog>` element is rendered where you place it and stays in the document while closed.
  `class` and other attributes land on it.
- The header shows the `title` and a close button. The body is the default slot (or the `body`
  prop). The footer is rendered only when you fill the `footer` slot: there are no built-in buttons.
  [`<BDialogActions>`](#ok-and-cancel-buttons) gives you OK and Cancel buttons in one line.
- <kbd>Esc</kbd>, a click on the backdrop and the header close button close the dialog. See
  [Static backdrop](#static-backdrop) to turn the first two off, and `no-header-close` for the third.

With `lazy`, the content is rendered when the dialog is first shown (and removed again after it is
hidden with `unmount-lazy`).

## Toggle dialog visibility

### Using `v-model`

<<< DEMO ./demo/DialogModel.vue

### Using the `v-b-toggle` directive

`v-b-toggle` opens the dialog with the given `id` and keeps `aria-controls` and `aria-expanded` on
the trigger up to date.

<<< DEMO ./demo/DialogDirective.vue

### Using exposed methods

You can control the dialog through a template ref. See the
[Component Reference Exposed section](#comp-reference-bdialog-exposed) for the available methods.

<<< DEMO ./demo/DialogExposed.vue

### Using the `useComponentToggle` composable

<<< DEMO ./demo/DialogToggle.vue

### Using slot scope methods

Every slot receives `show`, `hide`, `toggle`, `ok`, `cancel` and `close`. See
[Custom rendering with slots](#custom-rendering-with-slots).

## OK and Cancel buttons

`<BDialogActions>` renders a Cancel and an OK button for the `footer` slot. OK calls the dialog's
`ok()`, Cancel hides it with trigger `'cancel'`. Titles, `ok-only`, disabling and per-button
attributes (including `BButton` props such as `variant`, `color` and `size`) are props of
`<BDialogActions>`; the `ok` and `cancel` slots replace the button content.

<<< DEMO ./demo/DialogActions.vue

Set `focus="ok"` or `focus="cancel"` on the dialog to focus one of the two buttons when it opens.

## Events

### Visibility events

- `show` - before the dialog is shown. Cancelable
- `shown` - after the dialog is shown and its transition ended
- `hide` - before the dialog is hidden. Cancelable. `trigger` says what asked for it
- `hidden` - after the dialog is hidden and its transition ended
- `show-prevented` / `hide-prevented` - a show or hide was prevented, or a close request was refused
  (see [Static backdrop](#static-backdrop))
- `toggle` / `toggle-prevented` - `toggle()` was called / prevented

### Request events

- `ok` - `ok()` was called (the `<BDialogActions>` OK button, or the `ok` slot function), before
  `hide`. Cancelable: validate here.
- `cancel` - the user asked to close the dialog with <kbd>Esc</kbd>, before `hide`. Cancelable. This
  is the meaning the native `<dialog>` and Bootstrap give `cancel`; it is **not** the Cancel button.

There are no `close`, `esc` or `backdrop` events. Every way of closing emits `hide` and `hidden`
with a `trigger`:

| `trigger`    | Cause                                                                                   |
| ------------ | --------------------------------------------------------------------------------------- |
| `'ok'`       | `ok()`                                                                                  |
| `'cancel'`   | `cancel()` (the `<BDialogActions>` Cancel button)                                       |
| `'close'`    | `close()` (the header close button)                                                     |
| `'esc'`      | The <kbd>Esc</kbd> key                                                                  |
| `'backdrop'` | A click on the backdrop                                                                 |
| `'submit'`   | A `<form method="dialog">` inside the dialog was submitted                              |
| `'native'`   | The browser closed the dialog itself. This `hide` cannot be prevented                   |
| anything     | The argument of `hide(trigger)`; `'modelValue'` when `v-model` was set to `false`       |

All events receive a `BvTriggerableEvent`:

| Property or Method | Description                                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `preventDefault()` | Prevents the show or hide (when `cancelable`)                                                                                                              |
| `trigger`          | See the table above                                                                                                                                        |
| `target`           | The dialog element                                                                                                                                         |
| `componentId`      | The dialog's id                                                                                                                                            |
| `cancelable`       | Whether the event can be prevented                                                                                                                         |
| `defaultPrevented` | Whether `preventDefault()` has been called                                                                                                                 |
| `signal`           | An `AbortSignal`, aborted once the dialog commits to its next show or hide, or unmounts. See [Async work in event handlers](#async-work-in-event-handlers) |

## Prevent closing

Call `preventDefault()` on `hide` (or on `ok` / `cancel`) to keep the dialog open.

<<< DEMO ./demo/DialogPrevent.vue

### Async work in event handlers

`preventDefault()` has to be called synchronously, so to validate or save before closing, prevent the
event, do the work, then call `hide()` yourself. Pass `event.signal` to that work: it is aborted if
the dialog is closed another way (for example <kbd>Esc</kbd> or the Cancel button) or unmounts
before the work finishes. A close request that is refused (such as a backdrop click with
`backdrop="static"`) does not abort it.

<<< FRAGMENT ./demo/DialogAsyncOk.ts#snippet{ts}

If a listener does not prevent the event, the dialog commits to hiding right after it, so
`event.signal` is already aborted.

## Modal and non-modal

Set `:modal="false"` for a non-modal dialog. It is opened with the browser's `show()`: no backdrop,
no focus containment, the page stays usable and scrollable. It is positioned with
`position: fixed`, so unlike a modal dialog it is affected by a transformed ancestor.

<<< DEMO ./demo/DialogNonModal.vue

## Static backdrop

- `backdrop="static"` keeps the dialog open when the backdrop is clicked; `:backdrop="false"`
  ignores the click silently.
- `:keyboard="false"` keeps it open when <kbd>Esc</kbd> is pressed.

A refused close request emits `hide-prevented` (with the `trigger`) and plays a short bounce. Call
`preventDefault()` on `hide-prevented` to skip the bounce.

<<< DEMO ./demo/DialogStatic.vue

The backdrop itself is always drawn for a modal dialog. To hide it, set
`--bs-dialog-backdrop-bg: transparent` and `--bs-dialog-backdrop-blur: 0` on the dialog.

## Forms

A `<form method="dialog">` inside the dialog closes it on submit. The dialog hides with trigger
`'submit'` (the `hide` event is cancelable as usual), and the submit button's `value` is available
as the exposed `returnValue`.

<<< DEMO ./demo/DialogForm.vue

`returnValue` also holds the `value` passed to `hide(trigger, value)` or `ok(value)`.

## Styling, options, and customization

### Sizes

`size` accepts `sm`, `lg` and `xl` and renders `.dialog-<size>`.

<<< DEMO ./demo/DialogSizes.vue

### Fullscreen

`fullscreen` makes the dialog cover the viewport. Pass a breakpoint to do so only below that
breakpoint.

<<< DEMO ./demo/DialogFullscreen.vue

### Scrolling long content

A dialog that is taller than the viewport is cut off at the viewport edge; set `scrollable` so the
body scrolls instead.

<<< DEMO ./demo/DialogScrollOverflow.vue

<<< DEMO ./demo/DialogScrollableContent.vue

A modal dialog is always centered in the viewport.

### Transitions

Dialogs fade by default. `slide="down"` or `slide="up"` adds a slide, and `no-transition` opens and
closes at once. Duration and easing come from the `--bs-dialog-transition-duration` and
`--bs-dialog-transition-timing` CSS variables. With `prefers-reduced-motion`, Bootstrap turns the
transition off.

<<< DEMO ./demo/DialogSlide.vue

### Colors

`header-color`, `body-color` and `footer-color` take color objects (`theme`, `bg`, `fg`, and
`border` for the header and footer); see [Color Themes](/docs/reference/color-variants).

<<< DEMO ./demo/DialogVariants.vue

For anything else, `header-attrs`, `title-attrs`, `body-attrs` and `footer-attrs` are bound to
their part (`class` and `style` are merged), for example
`:title-attrs="{ class: 'visually-hidden' }"`. `header-close` configures the close button:
`{ label, attrs }`.

### Custom rendering with slots

| Slot           | Description                                                               |
| -------------- | ------------------------------------------------------------------------- |
| `default`      | The dialog body                                                           |
| `title`        | The content of the title                                                  |
| `header`       | Replaces the content of the header, including the title and close button  |
| `header-close` | Replaces the header close button                                          |
| `footer`       | The dialog footer. Without it, no footer is rendered                      |

All slots receive the same scope:

| Method or Property      | Description                                                                 |
| ----------------------- | --------------------------------------------------------------------------- |
| `ok(value?)`            | Emits `ok` (cancelable), then hides with `trigger = 'ok'`                   |
| `cancel()`              | Hides with `trigger = 'cancel'`                                             |
| `close()`               | Hides with `trigger = 'close'`                                              |
| `hide(trigger?, value?)` | Hides with the given `trigger`                                              |
| `show()`, `toggle()`    | Shows / toggles the dialog                                                  |
| `visible`, `active`     | Whether the dialog is shown, and whether it is on screen (also while it hides) |
| `id`                    | The id of the dialog element                                                |

<<< DEMO ./demo/DialogScopedSlots.vue

## Multiple dialogs

Modal dialogs stack in the order they were opened: the browser puts each new one on top, with its
own backdrop, and <kbd>Esc</kbd> closes the topmost one. There is no z-index to manage.

<<< DEMO ./demo/DialogStacking.vue

### Swapping dialogs

A `v-b-toggle` trigger inside an open dialog **swaps** that dialog for its target instead of
stacking: the target opens (its backdrop starts opaque, `.dialog-swap-in`) and the current dialog
closes at once (`.dialog-instant`) with the trigger `'swap'`. Both cancelable events are checked
first: if the target's `show` or the current dialog's `hide` is prevented, neither dialog changes.
Open a dialog through `v-model`, its exposed methods or `useDialog()` to stack it instead.

This is Bootstrap v6's own behavior for a `data-bs-toggle="dialog"` trigger inside an open dialog.
Swap suits "next step" flows (wizards, one dialog leading to the next), where the previous
dialog is done and stacking would only darken the page with a second backdrop. Stack when the
first dialog must stay open underneath, for example a confirmation on top of a form.

<<< DEMO ./demo/DialogSwap.vue

### Tooltips, popovers and toasts

Everything outside an open modal dialog is inert and painted below it. Content that is teleported
out of the dialog, such as a popover with `teleport-to="body"` or a toast shown through
`useToast()`, ends up behind the dialog. Render such content inside the dialog.

## Programmatic dialogs

To create dialogs from code and await their result, see [useDialog](/docs/composables/useDialog).
A dialog created without a `footer` slot gets `<BDialogActions>` as its footer.

If you are looking for replacements for `$bvModal.msgBoxOk` and `$bvModal.msgBoxConfirm`, see the
[migration knowledge base](/docs/migration-data/components/bmodal#replacement-for-modal-message-boxes).

## Accessibility

A modal `<BDialog>` gets its accessibility behavior from the browser: the `dialog` role,
`aria-modal`, focus containment, an inert page behind it, <kbd>Esc</kbd> to close, and focus
returned to the previously focused element when it closes. A non-modal dialog does not contain
focus and leaves the page interactive.

For ARIA attributes on triggers, see
[ARIA Trigger Registration for Component Visibility](/docs/reference/accessibility#aria-trigger-registration-for-component-visibility).

### Labelling

`aria-labelledby` points at the title while the header is rendered. With `no-header`, or a `header`
slot without an element carrying the title id (`<id>-label`), pass `aria-label` to the dialog. To
keep a title for screen readers only, use `:title-attrs="{ class: 'visually-hidden' }"`.

### Initial focus

When the dialog opens, the browser focuses the first element inside it with the `autofocus`
attribute, or else the first focusable element.

<<< DEMO ./demo/DialogAccessibilityFocus.vue

To focus a built-in button, set `focus` to `'close'` (the header close button), or to `'ok'` /
`'cancel'` (the `<BDialogActions>` buttons).

### Keyboard navigation

Avoid `tabindex` values other than `0` and `-1` inside the dialog: they make it hard for people who
rely on assistive technology to move through the content.

<!-- Component reference added automatically from component package.json -->

## Internationalization

<Internationalization />
