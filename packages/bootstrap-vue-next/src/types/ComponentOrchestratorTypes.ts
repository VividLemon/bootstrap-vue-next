/* oxlint-disable no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {type Component, type ComponentPublicInstance, type MaybeRef, type Ref} from 'vue'
import type {BDialogProps, BPopoverProps, BToastProps, BTooltipProps} from './ComponentProps'
import type {ContainerPosition} from './Alignment'
import type {BDialogSlots, BPopoverSlots, BToastSlots, BTooltipSlots} from './ComponentSlots'
import type {BDialogEmits, BPopoverEmits, BToastEmits, BTooltipEmits} from './ComponentEmits'
import type {BvTriggerableEvent} from '../utils'

// Common
export type ControllerKey = symbol | string
type Prefix<P extends string, S extends string> = `${P}${S}`
export type CamelCase<S extends string> = S extends `${infer P1}-${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : Lowercase<S>
/**
 * The second argument of `create()`: library options, read once
 */
export type OrchestratorCreateOptions = {
  /**
   * `show()` resolves as soon as the component starts hiding (`hide`), not after `hidden`.
   * `show({resolveOnHide})` overrides it for one show
   */
  resolveOnHide?: boolean
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
   * `'native'`, `'swap'`, `'abort'`, `'destroy'`, a custom trigger from `hide(trigger)`, or `null`
   * (no trigger, or the show was prevented)
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
  resolve: (value: BvTriggerableEvent) => void
  controller: ComponentController<Component, Props, Result>
}

type OrchestratorCreateBase<
  BaseComponentProps extends Record<string, any>,
  SuppliedComponentProps extends Record<string, any>,
  BaseComponentSlots extends Record<string, any>,
  BaseComponentEmits extends Record<string, any>,
> = BaseComponentProps & {
  component?: Readonly<Component>
  slots?: {
    [K in keyof BaseComponentSlots]?: BaseComponentSlots[K] | Readonly<Component>
  }
} & {
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
  slots?: {
    [K in keyof BaseComponentSlots]?: BaseComponentSlots[K] | Readonly<Component>
  }
  /**
   * If this is the prop that is passed in, it will be that
   * If the input is undefined, it will be a symbol stored in the Map<>
   */
  id: string | symbol
  fns: {
    resolve: (value: BvTriggerableEvent) => void
    setRef: (v: ComponentPublicInstance) => void
    destroy: () => Promise<void>
  }
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
  BToastSlots,
  BToastEmits
>
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
> = OrchestratorCreateBase<
  BTooltipProps,
  ComponentProps,
  Omit<BTooltipSlots, 'activator'>,
  BTooltipEmits
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
> = OrchestratorCreateBase<
  BPopoverProps,
  ComponentProps,
  Omit<BPopoverSlots, 'activator'>,
  BPopoverEmits
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
> = OrchestratorCreateBase<BDialogProps, ComponentProps, BDialogSlots, BDialogEmits>
export type DialogOrchestratorCreateParam<
  ComponentProps extends Record<string, any> = Record<string, any>,
> = MaybeRef<DialogOrchestratorCreateParamBase<ComponentProps>>
export type DialogOrchestratorArrayValue = ArrayValue<BDialogProps, BDialogSlots, BDialogEmits>

export type OrchestratorArrayValue =
  | ToastOrchestratorArrayValue
  | DialogOrchestratorArrayValue
  | PopoverOrchestratorArrayValue
  | TooltipOrchestratorArrayValue
