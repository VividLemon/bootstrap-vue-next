<template>
  <details
    :id="computedId"
    class="accordion-item"
    :name="parentData?.name.value"
    :open="modelValue"
    :style="computedStyle"
    @toggle="onToggle"
  >
    <summary class="accordion-header" v-bind="props.headerAttrs">
      <slot name="title" :open="modelValue">{{ props.title }}</slot>
      <slot name="icon" :open="modelValue">
        <svg
          class="accordion-icon"
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m2 5 6 6 6-6" />
        </svg>
      </slot>
    </summary>
    <div class="accordion-body" v-bind="props.bodyAttrs">
      <slot v-if="renderBody" />
    </div>
  </details>
</template>

<script setup lang="ts">
import {computed, type CSSProperties, inject, ref, watch} from 'vue'
import {accordionInjectionKey} from '../../utils/keys'
import {useDefaults} from '../../composables/useDefaults'
import {useId} from '../../composables/useId'
import type {BAccordionItemEmits, BAccordionItemProps, BAccordionItemSlots} from '../../types'
import {isReadOnlyArray} from '../../utils/object'
import {accordionNoTransitionStyle} from './accordionNoTransitionStyle'

const _props = withDefaults(defineProps<Omit<BAccordionItemProps, 'modelValue'>>(), {
  bodyAttrs: undefined,
  headerAttrs: undefined,
  id: undefined,
  lazy: false,
  noTransition: false,
  title: undefined,
})
const props = useDefaults(_props, 'BAccordionItem')
const emit = defineEmits<BAccordionItemEmits>()
defineSlots<BAccordionItemSlots>()

const modelValue = defineModel<Exclude<BAccordionItemProps['modelValue'], undefined>>({
  default: false,
})

const parentData = inject(accordionInjectionKey, null)

const computedId = useId(() => props.id, 'accordion_item')

const openInParent = computed(() => {
  const open = parentData?.openItem.value
  return isReadOnlyArray(open) ? open.includes(computedId.value) : open === computedId.value
})

if (parentData) {
  // Synchronous during setup, so the server renders the same `open` attribute as the client
  if (modelValue.value) parentData.setItemOpen(computedId.value, true)
  else if (openInParent.value) modelValue.value = true
}

watch(openInParent, (open) => {
  if (open !== modelValue.value) modelValue.value = open
})
watch(modelValue, (open) => {
  if (parentData && open !== openInParent.value) parentData.setItemOpen(computedId.value, open)
})

// The native `toggle` event covers every browser-driven change: clicks, keyboard, find-in-page,
// fragment navigation and `name` exclusivity closing a sibling
const onToggle = (event: Event) => {
  const {open} = event.currentTarget as HTMLDetailsElement
  if (open !== modelValue.value) modelValue.value = open
  emit('toggle', event as ToggleEvent)
}

const hasOpened = ref(modelValue.value)
watch(modelValue, (open) => {
  if (open) hasOpened.value = true
})
const renderBody = computed(
  () => !(props.lazy || parentData?.lazy.value) || hasOpened.value || modelValue.value
)

const computedStyle = computed<CSSProperties | undefined>(() =>
  props.noTransition ? accordionNoTransitionStyle : undefined
)
</script>
