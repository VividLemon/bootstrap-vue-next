<template>
  <ConditionalTeleport :to="teleportTo" :disabled="!teleportTo">
    <div class="orchestrator-container" v-bind="$attrs">
      <div
        v-for="(value, key) in positionedItems"
        :key="key"
        :class="value.class"
        :style="value.style"
      >
        <!-- Toasts keep their list transition and its span wrappers. Dialogs, popovers and
          tooltips animate themselves, so they render bare. The two branches render the same item -->
        <TransitionGroup v-if="value.transitionGroupName" :name="value.transitionGroupName">
          <span v-for="item in value.items" :key="item.id">
            <component
              :is="item.component"
              v-bind="itemProps(key, item)"
              :ref="item.fns.setRef"
              initial-animation
              @update:model-value="(v: boolean | number) => syncModelValue(key, item.id, v)"
              @show-prevented="item.fns.resolve"
              @hide="(e: BvTriggerableEvent) => onHide(item, e)"
              @hidden="(e: BvTriggerableEvent) => onHidden(item, e)"
            >
              <template v-for="(comp, slot) in item.slots" #[slot]="scope" :key="slot">
                <component :is="comp" v-bind="scope" />
              </template>
            </component>
          </span>
        </TransitionGroup>
        <template v-else>
          <template v-for="item in value.items" :key="item.id">
            <component
              :is="item.component"
              v-bind="itemProps(key, item)"
              :ref="item.fns.setRef"
              initial-animation
              @update:model-value="(v: boolean | number) => syncModelValue(key, item.id, v)"
              @show-prevented="item.fns.resolve"
              @hide="(e: BvTriggerableEvent) => onHide(item, e)"
              @hidden="(e: BvTriggerableEvent) => onHidden(item, e)"
            >
              <template v-for="(comp, slot) in item.slots" #[slot]="scope" :key="slot">
                <component :is="comp" v-bind="scope" />
              </template>
            </component>
          </template>
        </template>
      </div>
    </div>
  </ConditionalTeleport>
</template>

<script setup lang="ts">
import {computed, inject, type Ref, watch} from 'vue'
import {warn} from '../../utils/console'
import {orchestratorRegistryKey, type OrchestratorStoreObject} from '../../utils/keys'
import {positionClasses} from '../../utils/positionClasses'
import type {BvTriggerableEvent} from '../../utils'
import type {
  BOrchestratorProps,
  ContainerPosition,
  ControllerKey,
  OrchestratorArrayValue,
} from '../../types'
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

/** The items of one store group, filtered, without an intermediate array per step */
const listItems = <T extends OrchestratorArrayValue>(
  enabled: boolean,
  group: Map<ControllerKey, Ref<T>> | undefined
): T[] => {
  if (!enabled || !group) return []
  const list = Array.from(group.values(), (item) => item.value)
  return props.filter ? list.filter(props.filter) : list
}

const items = computed(() => {
  const store = orchestratorRegistry?.store.value
  return {
    tooltip: listItems(!props.noPopovers, store?.tooltip),
    dialog: listItems(!props.noDialogs, store?.dialog),
    popover: listItems(!props.noPopovers, store?.popover),
    toast: listItems(!props.noToasts, store?.toast),
  } satisfies Record<keyof OrchestratorStoreObject, unknown>
})

type Item = ValueInMapRecord<OrchestratorStoreObject[keyof OrchestratorStoreObject]>['value']

const itemProps = (group: string, item: Item) =>
  // Dialogs live in the top layer; the others render inside the orchestrator container
  group === 'dialog' ? item.props : {...item.props, teleportDisabled: true}

const onHide = (item: Item, e: BvTriggerableEvent) => {
  item.props.onHide?.(e)
  // The controller settles on hide only for a show with resolveOnHide
  if (!e.defaultPrevented) item.fns.resolve(e)
}

const onHidden = (item: Item, e: BvTriggerableEvent) => {
  item.props.onHidden?.(e)
  if (e.defaultPrevented) return
  // With resolveOnHide the show() already settled on hide. This settles a later wait, such as
  // destroy() called right after that show() resolved
  item.fns.resolve(e)
}

type ItemObject = {
  class?: string
  style?: string
  transitionGroupName?: string
  items: Item[]
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

  // Only groups with items get a container, so no empty element is rendered for them
  const groups: Record<string, ItemObject> = groupedToastItems
  if (items.value.dialog.length > 0) groups.dialog = {items: items.value.dialog}
  if (items.value.popover.length > 0) groups.popover = {items: items.value.popover}
  if (items.value.tooltip.length > 0) groups.tooltip = {items: items.value.tooltip}
  return groups as Record<
    ContainerPosition | keyof Omit<OrchestratorStoreObject, 'toast'>,
    ItemObject
  >
})
</script>
