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
          tooltips animate themselves, so they render bare. The two branches render the same item:
          keep their <component> tags in sync. A change to one branch only is a bug -->
        <TransitionGroup v-if="value.transitionGroupName" :name="value.transitionGroupName">
          <span v-for="item in value.items" :key="item.id">
            <OrchestratorItem :link="item.fns.link">
              <component
                :is="item.component"
                v-bind="itemProps(key, item)"
                :ref="item.fns.setRef"
                initial-animation
              >
                <template v-for="(comp, slot) in item.slots" #[slot]="scope" :key="slot">
                  <component :is="comp" v-bind="scope" />
                </template>
              </component>
            </OrchestratorItem>
          </span>
        </TransitionGroup>
        <template v-else>
          <OrchestratorItem v-for="item in value.items" :key="item.id" :link="item.fns.link">
            <component
              :is="item.component"
              v-bind="itemProps(key, item)"
              :ref="item.fns.setRef"
              initial-animation
            >
              <template v-for="(comp, slot) in item.slots" #[slot]="scope" :key="slot">
                <component :is="comp" v-bind="scope" />
              </template>
            </component>
          </OrchestratorItem>
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
import type {
  BOrchestratorProps,
  ContainerPosition,
  ControllerKey,
  OrchestratorArrayValue,
} from '../../types'
import ConditionalTeleport from '../ConditionalTeleport.vue'
import OrchestratorItem from './OrchestratorItem'
import type {ValueInMapRecord} from '../../composables/orchestratorShared'

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
