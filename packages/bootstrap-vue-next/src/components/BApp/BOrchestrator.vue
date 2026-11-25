<template>
  <ConditionalTeleport :to="teleportTo" :disabled="!teleportTo">
    <div class="orchestrator-container" v-bind="$attrs">
      <div
        v-for="(value, key) in positionedItems"
        :key="key"
        :class="value.class"
        :style="value.style"
      >
        <!-- Toasts keep their list transition. Dialogs, popovers and tooltips animate themselves -->
        <component
          :is="value.transitionGroupName ? TransitionGroup : PassThrough"
          :name="value.transitionGroupName"
        >
          <component
            :is="value.transitionGroupName ? 'span' : PassThrough"
            v-for="{
              component,
              fns: {setRef, resolve: resolvePromise},
              props: componentProps,
              id,
              slots,
            } in value.items"
            :key="id"
          >
            <component
              :is="component"
              v-bind="{
                ...componentProps,
                ...(key === 'dialog' ? undefined : {teleportDisabled: true}),
              }"
              :ref="setRef"
              initial-animation
              @update:model-value="(value: boolean | number) => syncModelValue(key, id, value)"
              @show-prevented="resolvePromise"
              @hide="
                (e: BvTriggerableEvent) => {
                  componentProps.onHide?.(e)
                  // The controller settles on hide only for a show with resolveOnHide
                  if (!e.defaultPrevented) resolvePromise(e)
                }
              "
              @hidden="
                (e: BvTriggerableEvent) => {
                  componentProps.onHidden?.(e)
                  if (e.defaultPrevented) {
                    return
                  }
                  // With resolveOnHide the show() already settled on hide. This settles a later
                  // wait, such as destroy() called right after that show() resolved
                  resolvePromise(e)
                }
              "
            >
              <template v-for="(comp, slot) in slots" #[slot]="scope" :key="slot">
                <component :is="comp" v-bind="scope" />
              </template>
            </component>
          </component>
        </component>
      </div>
    </div>
  </ConditionalTeleport>
</template>

<script setup lang="ts">
import {computed, type FunctionalComponent, inject, TransitionGroup, watch} from 'vue'
import {warn} from '../../utils/console'
import {orchestratorRegistryKey, type OrchestratorStoreObject} from '../../utils/keys'
import {positionClasses} from '../../utils/positionClasses'
import type {BvTriggerableEvent} from '../../utils'
import type {BOrchestratorProps, ContainerPosition, ControllerKey} from '../../types'
import ConditionalTeleport from '../ConditionalTeleport.vue'
import type {ValueInMapRecord} from '../../composables/orchestratorShared'

/**
 * Keeps the store's modelValue in step with the component, which changes it itself when it is
 * shown or hidden through its own methods, its triggers, or a timeout. Controllers decide whether
 * a component is open from the store
 */
const syncModelValue = (group: string, id: ControllerKey, value: boolean | number): void => {
  const store = orchestratorRegistry?.store.value
  if (!store) return
  // Ids are only unique per store, so use the emitting item's own one. Toast groups are keyed by
  // position
  const items =
    group === 'dialog' || group === 'popover' || group === 'tooltip' ? store[group] : store.toast
  const item = items.get(id)
  if (item && item.value.props.modelValue !== value) {
    item.value = {...item.value, props: {...item.value.props, modelValue: value}} as never
  }
}

/** Renders its default slot without an element, for groups that need no wrapper */
const PassThrough: FunctionalComponent = (_, {slots}) => slots.default?.()

const props = withDefaults(defineProps<BOrchestratorProps>(), {
  noPopovers: false,
  noToasts: false,
  noDialogs: false,
  appendToast: false,
  filter: undefined,
})

const orchestratorRegistry = inject(orchestratorRegistryKey, null)

if (orchestratorRegistry) {
  if (!orchestratorRegistry._isOrchestratorInstalled.value) {
    orchestratorRegistry._setOrchestratorInstalled(true)
  }
} else {
  warn(
    'BOrchestrator',
    'The orchestrator registry not found. Please use BApp, useRegistry or provide the plugin.'
  )
}

watch(
  () => props.appendToast,
  (value) => {
    orchestratorRegistry?._setToastAppend(value)
  },
  {immediate: true}
)

const items = computed(() => {
  const store = orchestratorRegistry?.store.value
  let filteredStore = {
    tooltip:
      !props.noPopovers && store?.tooltip ? [...store.tooltip.values()].map((e) => e.value) : [],
    dialog: !props.noDialogs && store?.dialog ? [...store.dialog.values()].map((e) => e.value) : [],
    popover:
      !props.noPopovers && store?.popover ? [...store.popover.values()].map((e) => e.value) : [],
    toast: !props.noToasts && store?.toast ? [...store.toast.values()].map((e) => e.value) : [],
  } satisfies Record<keyof OrchestratorStoreObject, unknown>

  if (props.filter) {
    filteredStore = {
      tooltip: filteredStore.tooltip.filter(props.filter),
      dialog: filteredStore.dialog.filter(props.filter),
      popover: filteredStore.popover.filter(props.filter),
      toast: filteredStore.toast.filter(props.filter),
    }
  }

  return filteredStore
})

type ItemObject = {
  class?: string
  style?: string
  transitionGroupName?: string
  items: ValueInMapRecord<OrchestratorStoreObject[keyof OrchestratorStoreObject]>['value'][]
}
const positionedItems = computed<
  Record<ContainerPosition | keyof Omit<OrchestratorStoreObject, 'toast'>, ItemObject>
>(() => {
  const toastDefaultPosition: ContainerPosition = 'bottom-start'
  const toastDefaults = (cls: ContainerPosition) =>
    ({
      class: `${positionClasses[cls]} toast-container position-fixed p-3`,
      style: 'width: calc(var(--bs-toast-max-width, 350px) + var(--bs-toast-padding-x, 1rem) * 2)',
      transitionGroupName: 'b-list',
    }) satisfies Partial<ItemObject>
  const groupedToastItems = items.value.toast.reduce(
    (acc, item) => {
      const pos = item.props.position ?? toastDefaultPosition
      ;(acc[pos] ??= {
        ...toastDefaults(pos),
        items: [],
      }).items.push(item)

      return acc
    },
    {} as Record<ContainerPosition, ItemObject>
  )

  const allGroups = {
    ...groupedToastItems,
    dialog: {items: items.value.dialog},
    popover: {items: items.value.popover},
    tooltip: {items: items.value.tooltip},
  }

  // Skip rendering empty containers (e.g. popover/tooltip/dialog groups with no active items)
  return Object.fromEntries(
    Object.entries(allGroups).filter(([, value]) => value.items.length > 0)
  ) as Record<ContainerPosition | keyof Omit<OrchestratorStoreObject, 'toast'>, ItemObject>
})
</script>
