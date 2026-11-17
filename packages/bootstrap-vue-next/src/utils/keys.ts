import type {ComponentInternalInstance, ComputedRef, InjectionKey, Ref} from 'vue'
import type {TabType} from '../types/Tab'
import type {AttrsValue} from '../types/AnyValuedAttributes'
import type {Numberish, ValidationState} from '../types/CommonTypes'
import type {LiteralUnion} from '../types/LiteralUnion'
import type {Size} from '../types/Size'
import type {RadiusElementExtendables} from '../types/RadiusElement'
import type {
  BgColor,
  ButtonVariant,
  ColorExtendables,
  FgColor,
  MaybeArray,
  ThemeProp,
} from '../types/ColorTypes'
import type {CheckboxValue} from '../types/CheckboxTypes'
import type {RadioValue} from '../types/RadioTypes'
import type {BreadcrumbItemRaw} from '../types/BreadcrumbTypes'
import type {
  DialogOrchestratorArrayValue,
  PopoverOrchestratorArrayValue,
  ToastOrchestratorArrayValue,
  TooltipOrchestratorArrayValue,
} from '../types/ComponentOrchestratorTypes'
import type {BvnComponentProps} from '../types/BootstrapVueOptions'

export const genericBvnPrefix = 'BootstrapVueNext__'

export const withBvnPrefix = (value: string, suffix: string = '') => {
  const suffixWithTrail = `${suffix}___`
  return `${genericBvnPrefix}ID__${value}__${suffix ? suffixWithTrail : ''}`
}

const createBvnInjectionKey = (name: string) => withBvnPrefix(name) as unknown as symbol // Type cast to symbol, these should be static
const createBvnRegistryInjectionKey = (name: string) =>
  withBvnPrefix(`${name}__registry`) as unknown as symbol

// BCarousel
export const carouselInjectionKey: InjectionKey<{
  background: Readonly<Ref<string | undefined>>
  width: Readonly<Ref<string | undefined>>
  height: Readonly<Ref<string | undefined>>
}> = createBvnInjectionKey('carousel')

// BTabs
export const tabsInjectionKey: InjectionKey<{
  lazy: Readonly<Ref<boolean>>
  card: Readonly<Ref<boolean>>
  noTransition: Readonly<Ref<boolean>>
  registerTab: (tab: ComputedRef<TabType>) => string
  unregisterTab: (id: string) => void
  activateTab: (id: string | undefined) => void
  activeTabAttrs: Readonly<Ref<Readonly<AttrsValue> | undefined>>
  inactiveTabAttrs: Readonly<Ref<Readonly<AttrsValue> | undefined>>
  tabAttrs: Readonly<Ref<Readonly<AttrsValue> | undefined>>
  activeId: Readonly<Ref<string | undefined>>
}> = createBvnInjectionKey('tabs')

// BProgress
export const progressInjectionKey: InjectionKey<{
  animated: Readonly<Ref<boolean | undefined>>
  max: Readonly<Ref<Numberish>>
  showProgress: Readonly<Ref<boolean | undefined>>
  showValue: Readonly<Ref<boolean | undefined>>
  striped: Readonly<Ref<boolean | undefined>>
}> = createBvnInjectionKey('progress')

// BListGroup
export const listGroupInjectionKey: InjectionKey<{
  numbered: Readonly<Ref<boolean>>
}> = createBvnInjectionKey('listGroup')

// BAvatarGroup
export const avatarGroupInjectionKey: InjectionKey<{
  overlapScale: Readonly<Ref<number>>
  size: Readonly<Ref<LiteralUnion<Size, Numberish> | undefined>>
  square: Readonly<Ref<boolean>>
  roundedProps: Readonly<Ref<RadiusElementExtendables>>
  theme: Readonly<Ref<ThemeProp | null>>
  bg: Readonly<Ref<MaybeArray<BgColor> | null>>
  fg: Readonly<Ref<MaybeArray<FgColor> | null>>
}> = createBvnInjectionKey('avatarGroup')

// BAccordion
export const accordionInjectionKey: InjectionKey<{
  openItem: Readonly<Ref<string | readonly string[] | undefined>>
  name: Readonly<Ref<string | undefined>>
  lazy: Readonly<Ref<boolean>>
  setItemOpen: (id: string, open: boolean) => void
}> = createBvnInjectionKey('accordion')

// BFormCheckboxGroup
export const checkboxGroupKey: InjectionKey<{
  modelValue: Ref<readonly CheckboxValue[]>
  switch: Readonly<Ref<boolean>>
  buttonVariant: Readonly<Ref<ButtonVariant | null>>
  buttonColor: Readonly<Ref<ColorExtendables>>
  form: Readonly<Ref<string | undefined>>
  name: Readonly<Ref<string>>
  state: Readonly<Ref<ValidationState | undefined>>
  plain: Readonly<Ref<boolean>>
  size: Readonly<Ref<Size | undefined>>
  required: Readonly<Ref<boolean>>
  buttons: Readonly<Ref<boolean>>
  disabled: Readonly<Ref<boolean>>
}> = createBvnInjectionKey('checkboxGroup')

export const radioGroupKey: InjectionKey<{
  modelValue: Ref<RadioValue>
  buttonVariant: Readonly<Ref<ButtonVariant | null>>
  buttonColor: Readonly<Ref<ColorExtendables>>
  form: Readonly<Ref<string | undefined>>
  name: Readonly<Ref<string>>
  buttons: Readonly<Ref<boolean>>
  state: Readonly<Ref<ValidationState | undefined>>
  plain: Readonly<Ref<boolean>>
  size: Readonly<Ref<Size | undefined>>
  required: Readonly<Ref<boolean>>
  disabled: Readonly<Ref<boolean>>
}> = createBvnInjectionKey('radioGroup')

// Collapse
export const collapseInjectionKey: InjectionKey<{
  id?: Readonly<Ref<string>>
  readonly hide?: () => void
  readonly show?: () => void
  readonly toggle?: () => void
  visible?: Readonly<Ref<boolean>>
  isNav?: Readonly<Ref<boolean>>
}> = createBvnInjectionKey('collapse')

// Show/Hide components
export type RegisterShowHideFnInput = {
  id: string
  component: ComponentInternalInstance
  value: Ref<boolean>
  toggle: (resolveOnHide?: boolean) => Promise<boolean | string>
  show: (resolveOnHide?: boolean) => Promise<boolean | string>
  hide: (trigger?: string) => Promise<boolean | string>
  registerTrigger: (trigger: string, el: Element) => void
  unregisterTrigger: (trigger: string, el: Element, clean: boolean) => void
}

export interface RegisterShowHideMapValue {
  id: string
  component: ComponentInternalInstance
  value: Readonly<Ref<boolean>>
  toggle: (resolveOnHide?: boolean) => Promise<boolean | string | null>
  show: (resolveOnHide?: boolean) => Promise<boolean | string | null>
  hide: (trigger?: string, noTraverse?: boolean) => Promise<boolean | string | null>
  registerTrigger: (trigger: string, el: Element) => void
  unregisterTrigger: (trigger: string, el: Element, clean: boolean) => void
}

/**
 * Represents an array of component instances with the same ID
 * Used to handle race conditions where multiple instances mount/unmount out of order
 */
export interface RegisterShowHideInstances {
  instances: RegisterShowHideMapValue[]
  getActive: () => RegisterShowHideMapValue | undefined
}

export interface RegisterShowHideValue {
  register: (input: RegisterShowHideFnInput) => {
    unregister: () => void
    updateId: (newId: string, oldId: string) => void
  }
  values: Ref<Map<string, RegisterShowHideInstances>>
}
export const showHideRegistryKey: InjectionKey<RegisterShowHideValue> =
  createBvnRegistryInjectionKey('showHide')

export const dropdownInjectionKey: InjectionKey<{
  id?: Readonly<Ref<string>>
  readonly hide?: () => void
  readonly show?: () => void
  readonly toggle?: () => void
  visible?: Readonly<Ref<boolean>>
  isNav?: Readonly<Ref<boolean>>
}> = createBvnInjectionKey('dropdown')

export const navbarInjectionKey: InjectionKey<{
  tag?: Readonly<Ref<string>>
  noAutoClose?: Readonly<Ref<boolean>>
}> = createBvnInjectionKey('navbar')

export const rtlRegistryKey: InjectionKey<{
  isRtl: Ref<boolean>
  locale: Ref<string | undefined>
}> = createBvnRegistryInjectionKey('rtl')

export const breadcrumbGlobalIndexKey = `${genericBvnPrefix}global_breadcrumb`
export const breadcrumbRegistryKey: InjectionKey<{
  items: Ref<Record<string, BreadcrumbItemRaw[]>>
  reset: (key?: string) => void
}> = createBvnRegistryInjectionKey('breadcrumb')

/** A mounted `BDialog`, as the dialog stack knows it */
export interface DialogStackEntry {
  readonly id: Readonly<Ref<string>>
  readonly element: Readonly<Ref<HTMLDialogElement | null>>
  readonly show: () => Promise<boolean | string>
  readonly hide: (trigger?: string, value?: unknown) => Promise<boolean | string>
  /**
   * Hides the dialog at once (`.dialog-instant`, trigger `'swap'`) for the v6 swap. Returns
   * `false` when the dialog refused (its `hide` was prevented) or is not open
   */
  readonly hideForSwap: () => boolean
}

export interface DialogStackValue {
  /** Every mounted dialog */
  registry: Readonly<ShallowRef<readonly DialogStackEntry[]>>
  /** The open dialogs, in the order they opened (last is topmost) */
  stack: Readonly<ShallowRef<readonly DialogStackEntry[]>>
  register: (entry: DialogStackEntry) => {
    setOpen: (open: boolean) => void
    unregister: () => void
  }
}

export const dialogStackKey: InjectionKey<DialogStackValue> =
  createBvnRegistryInjectionKey('dialogStack')

// Dialog
export const dialogInjectionKey: InjectionKey<{
  id: Readonly<Ref<string>>
  show: () => void
  ok: (value?: unknown) => void
  cancel: () => void
  hide: (trigger?: string, value?: unknown) => void
  /** The built-in button that gets `autofocus` */
  focus: Readonly<Ref<'ok' | 'cancel' | 'close' | undefined>>
}> = createBvnInjectionKey('dialog')

export const defaultsKey: InjectionKey<Ref<Partial<BvnComponentProps>>> =
  createBvnRegistryInjectionKey('defaults')

export const inputGroupKey: InjectionKey<boolean> = createBvnInjectionKey('inputGroup')
/** Provided by BFormChips: chips inside it take their dismiss buttons out of the tab order */
export const chipInputKey: InjectionKey<boolean> = createBvnInjectionKey('chipInput')
export const buttonGroupKey: InjectionKey<boolean> = createBvnInjectionKey('buttonGroup')

export type OrchestratorStoreObject = {
  toast: Map<string | symbol, Ref<ToastOrchestratorArrayValue>>
  dialog: Map<string | symbol, Ref<DialogOrchestratorArrayValue>>
  popover: Map<string | symbol, Ref<PopoverOrchestratorArrayValue>>
  tooltip: Map<string | symbol, Ref<TooltipOrchestratorArrayValue>>
}
export const orchestratorRegistryKey: InjectionKey<{
  store: Ref<OrchestratorStoreObject>
  _isToastAppend: Readonly<Ref<boolean>>
  _setToastAppend: (value: boolean) => void
  _isOrchestratorInstalled: Readonly<Ref<boolean>>
  _setOrchestratorInstalled: (value: boolean) => void
}> = createBvnRegistryInjectionKey('orchestrator')

/**
 * Provided by an ancestor BFormGroup (or boundary like BFormFloatingLabel). Called once at
 * descendant setup to obtain state/disabled and a `track` callback. Call `track(idRef)` to
 * claim the group's `<label for="...">` target — used by form controls without their own
 * label (BFormInput, BFormTextarea, BFormSelect, or a plain BFormCheckbox/BFormRadio with
 * no slot). Skip `track` entirely when the consumer only needs state/disabled and must not
 * claim label-for (BFormCheckbox/BFormRadio that render their own label, BFormFloatingLabel
 * acting as a boundary, ARIA-role custom widgets).
 */
export const formGroupKey: InjectionKey<
  () => {
    state: Readonly<Ref<ValidationState | undefined>>
    disabled: Readonly<Ref<boolean>>
    track: (idRef: Readonly<Ref<string | null>>) => void
  }
> = createBvnInjectionKey('formGroupPlugin')

export const formSelectKey: InjectionKey<{
  modelValue: Readonly<Ref<unknown>>
}> = createBvnInjectionKey('formSelect')
// BTable keyboard navigation
export const tableKeyboardNavigationKey: InjectionKey<{
  rowNavigation: Readonly<Ref<boolean>>
  headerNavigation: Readonly<Ref<boolean>>
}> = createBvnInjectionKey('tableKeyboardNavigation')
