/* oxlint-disable no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {type Component, type ComponentPublicInstance, type MaybeRef, type Ref} from 'vue'
import type {BDialogProps, BPopoverProps, BToastProps, BTooltipProps} from './ComponentProps'
import type {ContainerPosition} from './Alignment'
import type {BDialogSlots, BPopoverSlots, BToastSlots, BTooltipSlots} from './ComponentSlots'
import type {BDialogEmits, BPopoverEmits, BToastEmits, BTooltipEmits} from './ComponentEmits'
import type {BvTriggerableEvent} from '../utils'
import type {ShowHideState} from '../composables/showHideMachine'

// Common
export type ControllerKey = symbol | string
type Prefix<P extends string, S extends string> = `${P}${S}`
export type CamelCase<S extends string> = S extends `${infer P1}-${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : Lowercase<S>
/**
 * Slot content for a created item: a slot function or a component, by slot name
 */
export type OrchestratorSlots<Slots extends Record<string, any> = Record<string, any>> = {
  [K in keyof Slots]?: Slots[K] | Readonly<Component>
}
/**
 * The second argument of `create()`: what renders the item, and library options. Read once
 */
export type OrchestratorCreateOptions<Slots extends Record<string, any> = Record<string, any>> = {
  /**
   * `show()` resolves as soon as the component starts hiding (`hide`), not after `hidden`.
   * `show({resolveOnHide})` overrides it for one show
   */
  resolveOnHide?: boolean
  /**
   * The component to render instead of the default one (`BDialog`, `BToast`, ...). It must render
   * a show/hide component: the controller shows and hides the first one it renders
   */
  component?: Readonly<Component>
  /** Slot content, by slot name: a slot function or a component */
  slots?: OrchestratorSlots<Slots>
}
export type OrchestratorShowOptions = {
  /**
   * Hides the component with the trigger `'abort'` when aborted. If it is already aborted, the
   * component is not shown and the promise resolves right away
   */
  signal?: AbortSignal
  /** Overrides the `create()` option `resolveOnHide` for this show */
  resolveOnHide?: boolean
}

/**
 * What a dialog controller's `show()` resolves with, once the dialog is hidden (or starts hiding,
 * with `resolveOnHide`)
 */
export interface DialogResult<T = unknown> {
  /**
   * What hid the dialog: `'ok'`, `'cancel'`, `'close'`, `'esc'`, `'backdrop'`, `'submit'`,
   * `'native'`, `'swap'`, `'abort'`, `'destroy'`, `'dispose'` (unmounted while shown), a custom
   * trigger from `hide(trigger)`,
   * `'show-prevented'` (a `show` listener prevented the show; nothing was shown), or `null` (no
   * trigger)
   */
  trigger: string | null
  /** `true` for the trigger `'ok'`, `false` for `'cancel'`, otherwise `null` */
  ok: boolean | null
  /**
   * The value of the hide that closed the dialog: `hide(trigger, value)`, `ok(value)`, or the
   * submitter's `value` of a `<form method="dialog">`
   */
  value?: T
}

// Promises
// TODO check which ones of these are async
export interface ComponentController<
  Component,
  Props extends Ref<OrchestratorArrayValue>,
  Result extends object = BvTriggerableEvent,
> extends AsyncDisposable {
  id: ControllerKey
  ref: ComponentPublicInstance<Component> | null
  show: (options?: OrchestratorShowOptions) => Promise<Result & AsyncDisposable>
  hide: (trigger?: string) => void
  toggle: () => void
  set: (val: Partial<Props['value']['props']>) => void
  get: () => Props | undefined
  destroy: () => Promise<void>
}

export type PromiseWithController<
  Component,
  Props extends Ref<OrchestratorArrayValue>,
  Result extends object = BvTriggerableEvent,
> = {
  controller: ComponentController<Component, Props, Result>
  /** What the store item carries for `BOrchestrator` */
  fns: OrchestratorItemFns
}

/**
 * The show/hide component an orchestrated item renders, as its controller sees it. The first
 * component using `useShowHide` inside the item connects itself.
 *
 * @internal
 */
export interface OrchestratedShowHide {
  /** The component's state machine state */
  readonly state: Readonly<Ref<ShowHideState>>
  /** Resolves like `useShowHide().show()` */
  readonly show: () => Promise<boolean | string>
  /** Hides without the trigger's own event. Resolves like `useShowHide().hide()` */
  readonly hide: (trigger?: string) => Promise<boolean | string>
  /** Resolves like `useShowHide().toggle()` */
  readonly toggle: () => Promise<boolean | string>
  /** The component's current `modelValue` */
  readonly model: () => boolean | number
  /** Writes the component's `modelValue`: a toast's countdown before it is shown again */
  readonly setModel: (value: number) => void
}

/**
 * What the controller gets told by the component connected to it.
 *
 * @internal
 */
export interface OrchestratorItemConnection {
  /** Every event the component emits, after its listeners ran and before it reads the outcome */
  readonly onEvent: (event: BvTriggerableEvent) => void
  /** Every state the machine moves to, before the events that follow from it */
  readonly onState: (state: ShowHideState) => void
  /** The component mounted: it can now be shown */
  readonly mounted: () => void
  /** The component unmounts */
  readonly disconnect: () => void
}

/**
 * Provided to the component an orchestrated item renders, so its show/hide state machine can
 * connect to the item's controller.
 *
 * @internal
 */
export interface OrchestratorItemLink {
  readonly connect: (showHide: OrchestratedShowHide) => OrchestratorItemConnection
  /** Whether a component is connected */
  readonly connected: () => boolean
}

/**
 * What a store item carries for `BOrchestrator` and the helpers (`useDialog().show(id)`, ...).
 *
 * @internal
 */
export interface OrchestratorItemFns {
  /** Connects the rendered show/hide component to the controller */
  link: OrchestratorItemLink
  setRef: (v: ComponentPublicInstance | null) => void
  destroy: () => Promise<void>
  /** Shows the item, without waiting for a result */
  show: () => void
  /** Hides the item, as `controller.hide(trigger)` */
  hide: (trigger?: string) => void
}

type OrchestratorCreateBase<
  BaseComponentProps extends Record<string, any>,
  SuppliedComponentProps extends Record<string, any>,
  BaseComponentEmits extends Record<string, any>,
> = BaseComponentProps & {
  [K in Extract<keyof BaseComponentEmits, string> as CamelCase<Prefix<'on-', K>>]?: (
    e: BaseComponentEmits[K][0]
  ) => void
} & SuppliedComponentProps
type ArrayValue<
  BaseComponentProps extends Record<string, any>,
  BaseComponentSlots extends Record<string, any>,
  BaseComponentEmits extends Record<string, any>,
> = {
  component?: Readonly<Component>
  slots?: OrchestratorSlots<BaseComponentSlots>
  /**
   * If this is the prop that is passed in, it will be that
   * If the input is undefined, it will be a symbol stored in the Map<>
   */
  id: string | symbol
  fns: OrchestratorItemFns
  props: BaseComponentProps & {
    [K in keyof BaseComponentEmits as CamelCase<Prefix<'on-', Extract<K, string>>>]?: (
      e: BaseComponentEmits[K][0]
    ) => void
  } & Record<string, unknown>
}

// Toast
export type ToastOrchestratorCreateParamBase<
  ComponentProps extends Record<string, any> = Record<string, any>,
> = OrchestratorCreateBase<
  BToastProps & {
    // These are props that are specific to how toast renders.
    // They aren't toast props, rather props for the orchestrator(s)
    /**
     * Position
     * @default 'top-end'
     */
    position?: ContainerPosition
    /**
     * Sets whether the toast should be appended to the container
     * @default undefined Implicitly defaults to the BOrchestrator's appendToast value
     */
    appendToast?: boolean
  },
  ComponentProps,
  BToastEmits
>
export type ToastOrchestratorCreateOptions = OrchestratorCreateOptions<BToastSlots>
export type ToastOrchestratorCreateParam<
  ComponentProps extends Record<string, any> = Record<string, any>,
> = MaybeRef<ToastOrchestratorCreateParamBase<ComponentProps>>
type ToastArrayProps = BToastProps & {
  position?: ContainerPosition
  appendToast?: boolean
}
export type ToastOrchestratorArrayValue = ArrayValue<ToastArrayProps, BToastSlots, BToastEmits>

// Tooltip
export type TooltipOrchestratorCreateParamBase<
  ComponentProps extends Record<string, any> = Record<string, any>,
> = OrchestratorCreateBase<BTooltipProps, ComponentProps, BTooltipEmits>
export type TooltipOrchestratorCreateOptions = OrchestratorCreateOptions<
  Omit<BTooltipSlots, 'activator'>
>
export type TooltipOrchestratorCreateParam<
  ComponentProps extends Record<string, any> = Record<string, any>,
> = MaybeRef<TooltipOrchestratorCreateParamBase<ComponentProps>>
export type TooltipOrchestratorArrayValue = ArrayValue<
  BTooltipProps,
  Omit<BTooltipSlots, 'activator'>,
  BTooltipEmits
>

// Popovers
export type PopoverOrchestratorCreateParamBase<
  ComponentProps extends Record<string, any> = Record<string, any>,
> = OrchestratorCreateBase<BPopoverProps, ComponentProps, BPopoverEmits>
export type PopoverOrchestratorCreateOptions = OrchestratorCreateOptions<
  Omit<BPopoverSlots, 'activator'>
>
export type PopoverOrchestratorCreateParam<
  ComponentProps extends Record<string, any> = Record<string, any>,
> = MaybeRef<PopoverOrchestratorCreateParamBase<ComponentProps>>
export type PopoverOrchestratorArrayValue = ArrayValue<
  BPopoverProps,
  Omit<BPopoverSlots, 'activator'>,
  BPopoverEmits
>

// Dialogs
export type DialogOrchestratorCreateParamBase<
  ComponentProps extends Record<string, any> = Record<string, any>,
> = OrchestratorCreateBase<BDialogProps, ComponentProps, BDialogEmits>
export type DialogOrchestratorCreateOptions = OrchestratorCreateOptions<BDialogSlots>
export type DialogOrchestratorCreateParam<
  ComponentProps extends Record<string, any> = Record<string, any>,
> = MaybeRef<DialogOrchestratorCreateParamBase<ComponentProps>>
export type DialogOrchestratorArrayValue = ArrayValue<BDialogProps, BDialogSlots, BDialogEmits>

export type OrchestratorArrayValue =
  | ToastOrchestratorArrayValue
  | DialogOrchestratorArrayValue
  | PopoverOrchestratorArrayValue
  | TooltipOrchestratorArrayValue
