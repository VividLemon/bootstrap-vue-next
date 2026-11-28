import {computed, inject, type MaybeRef, onScopeDispose, type Ref, ref} from 'vue'
import {
  dialogInjectionKey,
  dialogStackKey,
  type DialogStackEntry,
  orchestratorRegistryKey,
  type OrchestratorStoreObject,
} from '../../utils/keys'
import type {
  ComponentController,
  ControllerKey,
  DialogOrchestratorArrayValue,
  DialogOrchestratorCreateOptions,
  DialogOrchestratorCreateParamBase,
  DialogResult,
} from '../../types'
import type {BvTriggerableEvent} from '../../utils'
import {buildController, getOrchestratorControllerId} from '../orchestratorShared'
import {warn} from '../../utils/console'
import {BDialog, BDialogActions} from '../../components'

/** A controller for a dialog made with `useDialog().create()` */
export type DialogController = ComponentController<
  typeof BDialog,
  Ref<DialogOrchestratorArrayValue>,
  DialogResult
>

/** What `useDialog().get(id)` and `useDialog().current()` return */
export interface DialogHandle {
  /** The dialog's id */
  readonly id: string | symbol
  /** Shows the dialog */
  show: () => void
  /** Hides the dialog with `trigger` and, for a mounted dialog, `value` as its result value */
  hide: (trigger?: string, value?: unknown) => void
}

let hasWarnedPreMount = false

const toDialogResult = (event: BvTriggerableEvent, instance: unknown): DialogResult => {
  // A prevented show is told apart from a hide without trigger, as the show/hide promises do
  const trigger = event.eventType === 'show-prevented' ? 'show-prevented' : event.trigger
  // BDialog exposes the value of the hide that closed it. A custom `component` may not
  // A prevented show closed nothing, so it has no value (`returnValue` is the previous cycle's)
  const value =
    trigger !== 'show-prevented' &&
    instance !== null &&
    typeof instance === 'object' &&
    'returnValue' in instance
      ? instance.returnValue
      : undefined
  return {
    trigger,
    ok: trigger === 'ok' ? true : trigger === 'cancel' ? false : null,
    ...(value !== undefined ? {value} : {}),
  }
}

/**
 * Programmatic dialogs (`create`), and helpers to show and hide the dialogs of the app.
 *
 * Must be called in `setup()`, inside `BApp` (or with the plugin or `useRegistry`).
 */
export const useDialog = () => {
  const orchestratorRegistry = inject(orchestratorRegistryKey, null)
  if (!orchestratorRegistry)
    throw Error(
      'useDialog() must be called within setup(), and BApp, useRegistry or plugin must be installed/provided.'
    )
  const {store, _isOrchestratorInstalled} = orchestratorRegistry
  const dialogStack = inject(dialogStackKey, null)
  // The nearest dialog around the component that called useDialog(), for current()
  const parentDialog = inject(dialogInjectionKey, null)

  /**
   * Creates a dialog rendered by `BOrchestrator`. A dialog created before an orchestrator mounts
   * renders once one does (a dev warning is logged once). A `BDialog` created without a `footer` slot
   * gets `BDialogActions` (OK / Cancel) as its footer; pass `slots: {footer: undefined}` for
   * none.
   *
   * @param obj The dialog's props and `on*` listeners
   * @param options What renders the dialog (`component`, `slots`) and library options
   * (`resolveOnHide`), read once
   */
  // Uses a `function` declaration (rather than a generic arrow function assigned to a const) so
  // that TypeScript preserves per-call generic inference when `create` is returned as part of
  // `useDialog()`'s inferred return object.
  function create<
    ComponentProps extends Record<string, unknown> = Record<string, unknown>,
    T extends DialogOrchestratorCreateParamBase<ComponentProps> =
      DialogOrchestratorCreateParamBase<ComponentProps>,
  >(
    obj: MaybeRef<T> = {} as T,
    options: Readonly<DialogOrchestratorCreateOptions> = {}
  ): DialogController {
    // The store is reactive, so a dialog created before any BOrchestrator mounts renders once one
    // does (a router guard can run before the first render), so only warn, and only once: an SSR
    // server builds a new registry per request, so anything finer would repeat
    if (!_isOrchestratorInstalled.value && !hasWarnedPreMount) {
      hasWarnedPreMount = true
      warn(
        'useDialog',
        'A dialog was created before any BOrchestrator mounted. It will render once one does. Make sure BApp, or a BOrchestrator, is mounted.'
      )
    }

    const {component = BDialog, slots = {}, ...createOptions} = options
    // A BDialog without a footer slot gets BDialogActions. A slot set to `undefined` is left out
    // (`footer: undefined` opts out of the default)
    const withFooter =
      component === BDialog && !('footer' in slots) ? {...slots, footer: BDialogActions} : slots
    const itemSlots = Object.fromEntries(
      Object.entries(withFooter).filter(([, slot]) => slot !== undefined)
    )
    const resolvedProps = ref(obj)
    const dialogItems = store.value.dialog
    const {htmlAttributeId, storeId} = getOrchestratorControllerId(resolvedProps.value.id)

    const {controller, fns} = buildController<
      typeof BDialog,
      OrchestratorStoreObject['dialog'],
      DialogResult
    >(storeId, dialogItems, {createOptions, toResult: toDialogResult})

    const value = computed<DialogOrchestratorArrayValue>({
      get: () => {
        const props = resolvedProps.value

        return {
          component,
          slots: itemSlots,
          fns,
          id: storeId,
          props: {
            ...props,
            id: htmlAttributeId,
          },
        }
      },
      set: (v) => {
        resolvedProps.value = {
          ...resolvedProps.value,
          ...v.props,
        }
      },
    })

    dialogItems.set(storeId, value)

    onScopeDispose(async () => {
      await controller[Symbol.asyncDispose]()
    }, true)
    return controller as DialogController
  }

  const findMounted = (id: ControllerKey): DialogStackEntry | undefined => {
    if (typeof id !== 'string') return undefined
    const matches = dialogStack?.registry.value.filter((entry) => entry.id.value === id) ?? []
    // With duplicate ids, the one mounted last wins
    return matches[matches.length - 1]
  }

  const topmost = (): DialogStackEntry | undefined => {
    const stack = dialogStack?.stack.value ?? []
    return stack[stack.length - 1]
  }

  /**
   * Shows a dialog
   * @param id - The id of the dialog to show. Without it, the topmost open dialog
   */
  const show = (id?: ControllerKey): void => {
    if (id === undefined) {
      void topmost()?.show()
      return
    }
    const mounted = findMounted(id)
    if (mounted) {
      void mounted.show()
      return
    }
    // A created dialog whose component has not mounted yet: its controller shows it once it does
    store.value.dialog.get(id)?.value.fns.show()
  }

  /**
   * Hides a dialog, as its own `hide(trigger)` does (`'ok'` also emits `ok`, `'esc'` emits
   * `cancel`)
   * @param trigger - The trigger to hide the dialog with
   * @param id - The id of the dialog to hide. Without it, the topmost open dialog
   */
  const hide = (trigger?: string, id?: ControllerKey): void => {
    if (id === undefined) {
      void topmost()?.hide(trigger)
      return
    }
    const mounted = findMounted(id)
    if (mounted) {
      void mounted.hide(trigger)
      return
    }
    store.value.dialog.get(id)?.value.fns.hide(trigger)
  }

  /**
   * Hides every open dialog, topmost first
   * @param trigger - The trigger to hide the dialogs with
   */
  const hideAll = (trigger?: string): void => {
    for (const entry of [...(dialogStack?.stack.value ?? [])].reverse()) {
      void entry.hide(trigger)
    }
  }

  /**
   * Finds a dialog: a mounted `BDialog` with this id, or a dialog made with `create()` under it
   * @returns `null` when there is none
   */
  const get = (id: ControllerKey): DialogHandle | null => {
    const mounted = findMounted(id)
    if (mounted) {
      return {
        id,
        show: () => {
          void mounted.show()
        },
        hide: (trigger, value) => {
          void mounted.hide(trigger, value)
        },
      }
    }
    if (!store.value.dialog.has(id)) return null
    return {
      id,
      show: () => show(id),
      hide: (trigger) => hide(trigger, id),
    }
  }

  /**
   * The dialog the calling component is rendered in
   * @returns `null` when `useDialog()` was not called inside a `BDialog`
   */
  const current = (): DialogHandle | null =>
    parentDialog
      ? {
          id: parentDialog.id.value,
          show: parentDialog.show,
          hide: parentDialog.hide,
        }
      : null

  return {
    create,
    show,
    hide,
    hideAll,
    get,
    current,
  }
}
