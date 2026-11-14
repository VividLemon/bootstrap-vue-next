<template>
  <component
    :is="props.tag"
    :id="computedId"
    ref="_el"
    class="tab-pane"
    :class="computedClasses"
    role="tabpanel"
    :aria-labelledby="computedButtonId"
    v-bind="computedAttrs"
  >
    <slot v-if="showSlot" />
  </component>
</template>

<script setup lang="ts">
import {computed, inject, mergeProps, onUnmounted, ref, useAttrs, useTemplateRef, watch} from 'vue'
import {useId} from '../../composables/useId'
import {useDefaults} from '../../composables/useDefaults'
import type {TabType} from '../../types/Tab'
import type {BTabProps} from '../../types/ComponentProps'
import {tabsInjectionKey} from '../../utils/keys'
import type {BTabSlots} from '../../types/ComponentSlots'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<Omit<BTabProps, 'active'>>(), {
  buttonId: undefined,
  disabled: false,
  id: undefined,
  lazy: undefined,
  unmountLazy: undefined,
  noBody: false,
  tag: 'div',
  title: undefined,
  titleItemAttrs: undefined,
  titleLinkAttrs: undefined,
})
const props = useDefaults(_props, 'BTab')
const slots = defineSlots<BTabSlots>()
const attrs = useAttrs()

const activeModel = defineModel<Exclude<BTabProps['active'], undefined>>('active', {
  default: false,
})

const parentData = inject(tabsInjectionKey, null)

const localId = ref(props.id)
const internalId = useId('', 'tabpane')
const computedId = computed(() => props.id ?? localId.value ?? internalId.value)
const computedButtonId = useId(() => props.buttonId, 'tab')

const lazyRenderCompleted = ref(false)
const el = useTemplateRef('_el')

const processedAttrs = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {onClick: _, ...tabAttrs} = attrs
  return tabAttrs
})

function updateTab() {
  if (!parentData) return
  const newId = parentData.registerTab(
    computed(
      () =>
        ({
          internalId: internalId.value,
          id: computedId.value,
          active: activeModel.value,
          buttonId: computedButtonId.value,
          disabled: props.disabled,
          title: props.title,
          titleComponent: slots.title,
          titleItemAttrs: props.titleItemAttrs,
          titleLinkAttrs: props.titleLinkAttrs,
          onClick: attrs.onClick,
          el,
        }) as TabType
    )
  )
  if (newId !== localId.value) {
    localId.value = newId
  }
}

if (parentData) {
  updateTab()
  if (activeModel.value) {
    parentData.activateTab(internalId.value)
  }
}

onUnmounted(() => {
  if (!parentData) return
  parentData.unregisterTab(internalId.value)
})

const isActive = computed(() => parentData?.activeId.value === computedId.value)

const computedLazy = computed(() => !!(parentData?.lazy.value || props.lazy))

const computedActive = computed(() => isActive.value && !props.disabled)
const showSlot = computed(
  () =>
    computedActive.value ||
    !computedLazy.value ||
    (computedLazy.value && !props.unmountLazy && lazyRenderCompleted.value)
)

watch(showSlot, (shown) => {
  if (shown && !lazyRenderCompleted.value) lazyRenderCompleted.value = true
})

watch(isActive, (active) => {
  activeModel.value = active
})

watch(activeModel, (active) => {
  if (props.disabled) {
    activeModel.value = false
    return
  }
  if (!parentData) return
  if (!active) {
    if (isActive.value) {
      parentData.activateTab(undefined)
    }
    return
  }
  if (!isActive.value) {
    parentData.activateTab(internalId.value)
  }
})

// v6 fades a pane in from `.active` alone (CSS `@starting-style`); `.tab-pane-instant` opts out
const computedClasses = computed(() => ({
  'active': isActive.value,
  'card-body': parentData?.card.value && props.noBody === false,
  'tab-pane-instant': parentData?.noTransition.value,
}))

// Parent `tabAttrs` / `activeTabAttrs` / `inactiveTabAttrs`, then the tab's own attrs.
// `class` and `style` merge
const computedAttrs = computed(() =>
  mergeProps(
    parentData?.tabAttrs.value ?? {},
    (isActive.value ? parentData?.activeTabAttrs.value : parentData?.inactiveTabAttrs.value) ?? {},
    processedAttrs.value
  )
)

defineExpose({
  activate: () => {
    activeModel.value = true
  },
  deactivate: () => {
    activeModel.value = false
  },
})
</script>
