import {
  type ComponentPublicInstance,
  computed,
  inject,
  markRaw,
  type MaybeRef,
  onScopeDispose,
  ref,
  type Ref,
} from 'vue'
import {orchestratorRegistryKey, type OrchestratorStoreObject} from '../../utils/keys'
import type {
  ComponentController,
  OrchestratorCreateOptions,
  PopoverOrchestratorArrayValue,
  PopoverOrchestratorCreateParamBase,
  TooltipOrchestratorArrayValue,
  TooltipOrchestratorCreateParamBase,
} from '../../types'
import {BPopover, BTooltip} from '../../components'
import {buildController, getOrchestratorControllerId} from '../orchestratorShared'

export const usePopover = () => {
  const orchestratorRegistry = inject(orchestratorRegistryKey, null)
  if (!orchestratorRegistry)
    throw new Error(
      'usePopover() must be called within setup(), and BApp, useRegistry or plugin must be installed/provided.'
    )
  const {store, _isOrchestratorInstalled} = orchestratorRegistry

  /**
   * Create a popover or tooltip
   * @param obj The popover or tooltip props
   * @param tooltip If true, create a tooltip, otherwise create a popover
   * @param options Library options (`resolveOnHide`), read once
   * @returns {PromiseWithController<typeof BPopover | typeof BTooltip, PopoverOrchestratorCreateParam>} A split promise/controller object
   */
  // Uses `function` declarations (rather than generic arrow functions assigned to consts) so
  // that TypeScript preserves per-call generic inference when these are returned as part of
  // `usePopover()`'s inferred return object.
  function create<
    T extends PopoverOrchestratorCreateParamBase = PopoverOrchestratorCreateParamBase,
  >(
    obj: MaybeRef<T>,
    tooltip?: false,
    options?: Readonly<OrchestratorCreateOptions>
  ): ComponentController<typeof BPopover, Ref<PopoverOrchestratorArrayValue>>
  function create<
    T extends TooltipOrchestratorCreateParamBase = TooltipOrchestratorCreateParamBase,
  >(
    obj: MaybeRef<T>,
    tooltip: true,
    options?: Readonly<OrchestratorCreateOptions>
  ): ComponentController<typeof BTooltip, Ref<TooltipOrchestratorArrayValue>>
  function create(
    obj: MaybeRef<PopoverOrchestratorCreateParamBase | TooltipOrchestratorCreateParamBase>,
    tooltip = false,
    options: Readonly<OrchestratorCreateOptions> = {}
  ) {
    if (!_isOrchestratorInstalled.value)
      throw new Error('The BApp component must be mounted to use the popover controller')

    const comp = markRaw(tooltip ? BTooltip : BPopover)
    const resolvedProps = ref(obj)
    const type = tooltip ? 'tooltip' : 'popover'
    const pickedItems = store.value[type]
    const {htmlAttributeId, storeId} = getOrchestratorControllerId(resolvedProps.value.id)

    const {controller, resolve} = buildController<
      typeof BPopover | typeof BTooltip,
      OrchestratorStoreObject['popover'] | OrchestratorStoreObject['tooltip']
    >(storeId, pickedItems, {createOptions: {...options}})

    const value = computed<PopoverOrchestratorArrayValue>({
      get: () => {
        const {component = comp, slots, ...props} = resolvedProps.value

        return {
          component,
          slots,
          id: storeId,
          fns: {
            resolve,
            setRef: (v: ComponentPublicInstance) => {
              controller.ref = v
            },
            destroy: controller.destroy,
          },
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

    pickedItems.set(storeId, value)

    onScopeDispose(async () => {
      await controller[Symbol.asyncDispose]()
    }, true)

    return controller
  }

  function tooltip<
    T extends TooltipOrchestratorCreateParamBase = TooltipOrchestratorCreateParamBase,
  >(obj: MaybeRef<T>, options?: Readonly<OrchestratorCreateOptions>) {
    return create(obj, true, options)
  }

  function popover<
    T extends PopoverOrchestratorCreateParamBase = PopoverOrchestratorCreateParamBase,
  >(obj: MaybeRef<T>, options?: Readonly<OrchestratorCreateOptions>) {
    return create(obj, false, options)
  }

  return {
    _isOrchestratorInstalled,
    create,
    popover,
    tooltip,
    store,
  }
}
