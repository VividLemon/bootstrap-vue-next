---
title: useDialog
description: 'The `useDialog` composable creates dialogs from code and awaits their result, and shows or hides the dialogs of your app by id.'
---

## Setup

To use `useDialog`, you need one of the following setup approaches:

### BApp Component (Recommended)

<UseBAppSetup>

<<< FRAGMENT ./demo/OrchestratorSetup.vue

</UseBAppSetup>

### Plugin Setup (Legacy)

Alternatively, you can use the traditional plugin approach.

<UsePluginAlert />

## Creating dialogs

`create` adds a [`BDialog`](/docs/components/dialog) to the orchestrator and returns a controller.
`show()` opens it and resolves once it is hidden:

<<< DEMO ./demo/UseDialogBasic.vue

`BDialog` has no built-in buttons. A dialog created without a `footer` slot gets
[`BDialogActions`](/docs/components/dialog#ok-and-cancel-buttons) (OK and Cancel) as its footer.
Pass your own through the `slots` option, for example
`create(props, { slots: { footer: () => h(BDialogActions, { okOnly: true }) } })`, or
`{ slots: { footer: undefined } }` for no footer.

### Reactivity Within `create`

The first argument of `create` can be a `MaybeRef`, so its properties can be reactive:

<<< DEMO ./demo/UseDialogReactive.vue

### Advanced Creation

Props cover most situations, but you cannot put markup into a slot through props alone. The second
argument of `create` takes `component`, to render another component (an imported SFC or an inline
render function), and `slots`, to fill slots. `slots` maps a slot name to a render function or
component; render functions receive the slot's scope (`ok`, `cancel`, `close`, `hide`, `visible`,
...). Both are read once, when the dialog is created.

<<< DEMO ./demo/UseDialogAdvanced.vue

### Options

The second argument of `create` is read once:

```js
const result = await create(
  { title: 'Hello World!' },
  { slots: { default: () => h('p', 'Body') }, resolveOnHide: true },
).show()
```

- `component: Component`: renders this component instead of `BDialog`.
- `slots: Record<string, Function | Component>`: slot content, by slot name. A `BDialog` without a
  `footer` slot gets `BDialogActions` (OK / Cancel); pass `footer: undefined` for none.
- `resolveOnHide: boolean`: `show()` resolves as soon as the dialog starts hiding (`hide`), not
  after `hidden`. `show({ resolveOnHide })` overrides it for one show.

## The result

`show()` resolves with a plain object:

- `trigger: string | null`

  What hid the dialog: `'ok'`, `'cancel'` (the Cancel button), `'close'` (the header close
  button), `'esc'`, `'backdrop'`, `'submit'` (a `<form method="dialog">`), `'swap'`, `'abort'`
  (see [Cancelling with a signal](#cancelling-with-a-signal)), `'destroy'`, a trigger you passed
  to `hide(trigger)`, `'show-prevented'` (an `onShow` listener prevented the show, so nothing was
  shown), or `null` (no trigger).

- `ok: boolean | null`

  `true` for the trigger `'ok'`, `false` for `'cancel'`, otherwise `null`.

- `value?: unknown`

  The value of the hide that closed the dialog: `ok(value)` or `hide(trigger, value)` from a slot
  scope or `BDialogActions`, or the `value` of the button that submitted a `<form method="dialog">`.
  Left out when there is none.

<<< DEMO ./demo/UseDialogValue.vue

If the dialog prevents the show (an `onShow` listener calls `preventDefault()`), `show()` resolves
right away with `{trigger: 'show-prevented', ok: null}`.

## The controller

- `show: (options?: {signal?: AbortSignal; resolveOnHide?: boolean}) => Promise<DialogResult>`

  Shows the dialog and resolves with [the result](#the-result).

- `hide: (trigger?: string) => void`

  Hides the dialog with this trigger. It does not emit the trigger's own event (`ok`, `cancel`) and
  sets no `value`.

- `toggle: () => void`

  Toggles the dialog.

- `set: (props: Partial<BDialogProps>) => void` / `get()`

  Updates or reads the props the dialog was created with.

- `destroy: () => Promise<void>`

  Hides the dialog if it is open, then removes it from the orchestrator.

### Lifecycle

Created dialogs persist until you dispose them. Hiding a dialog does not remove it from the
orchestrator.

```js
const dialog = create({ title: 'Hello World!' })
try {
  await dialog.show()
  // do something
} finally {
  await dialog.destroy()
}
```

You can also use the TypeScript `await using` syntax for automatic disposal when the scope exits.
The controller and the result both dispose the dialog:

```js
await using dialog = create({ title: 'Hello World!' })
await dialog.show()
```

Managing the lifecycle yourself is useful when the dialog should keep what the user entered. Its
content stays mounted while it is hidden, so a form that keeps its own state still has it when you
call `show()` again; call `destroy()` when you no longer need it. Content rendered with `lazy` and
`unmountLazy` is unmounted after each hide instead.

Type something, press **Later**, then **Continue message**:

<<< DEMO ./demo/UseDialogDraft.vue

### Cancelling with a signal

Pass an `AbortSignal` to `.show()` to close the dialog when something else ends first, such as the
component that opened it unmounting. When the signal aborts, the dialog hides with the trigger
`'abort'` and the promise resolves. If the signal is already aborted, the dialog is not shown.

<<< FRAGMENT ./demo/UseDialogShowSignal.ts#snippet{ts}

Built-in signals work too: `AbortSignal.timeout(30_000)` closes an unanswered dialog, and
`AbortSignal.any([a, b])` closes it on whichever comes first.

## Showing and hiding dialogs

`useDialog()` also controls the dialogs of your app, declared in templates or made with `create`.

| Function                 | Description                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| `show(id?)`              | Shows the dialog with this id (the topmost open dialog without one)                               |
| `hide(trigger?, id?)`    | Hides the dialog with this id, as its own `hide(trigger)` does (the topmost open one without an id) |
| `hideAll(trigger?)`      | Hides every open dialog, topmost first                                                            |
| `get(id)`                | `{id, show(), hide(trigger?, value?)}` for that dialog, or `null`                                 |
| `current()`              | The same for the dialog the calling component is rendered in, or `null`                           |

A dialog made with `create` renders through a mounted orchestrator (`BApp`, or `BOrchestrator`); one created before an orchestrator mounts renders once it does (a warning is logged once in development). For any other show/hide component,
use [`useComponentToggle`](/docs/composables/useComponentToggle).

<<< DEMO ./demo/UseDialogNested.vue

<script setup lang="ts">
import UsePluginAlert from '../../components/UsePluginAlert.vue'
import PageHeader from '../../components/PageHeader.vue'

</script>
