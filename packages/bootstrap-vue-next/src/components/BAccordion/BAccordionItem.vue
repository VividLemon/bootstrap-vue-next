<template>
  <details
    :id="computedId"
    class="accordion-item"
    :name="parentData?.name.value"
    :open="isOpen"
    @toggle="onToggle"
  >
    <summary class="accordion-header" :class="props.headerClass" v-bind="props.headerAttrs">
      <slot name="title"> {{ props.title }} </slot>
      <svg
        class="accordion-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m2 5 6 6 6-6" />
      </svg>
    </summary>
    <div class="accordion-body" v-bind="props.bodyAttrs" :class="props.bodyClass">
      <slot />
    </div>
  </details>
</template>

<script setup lang="ts">
import {computed, inject, watch} from 'vue'
import {accordionInjectionKey} from '../../utils/keys'
import {useDefaults} from '../../composables/useDefaults'
import {useId} from '../../composables/useId'
import type {BAccordionItemEmits, BAccordionItemProps, BAccordionItemSlots} from '../../types'
import {isReadOnlyArray} from '../../utils/object'

const _props = withDefaults(defineProps<Omit<BAccordionItemProps, 'modelValue'>>(), {
  bodyAttrs: undefined,
  bodyClass: undefined,
  headerAttrs: undefined,
  headerClass: undefined,
  id: undefined,
  title: undefined,
})
const props = useDefaults(_props, 'BAccordionItem')
const emit = defineEmits<BAccordionItemEmits>()
defineSlots<BAccordionItemSlots>()

const parentData = inject(accordionInjectionKey, null)

const computedId = useId(() => props.id, 'accordion_item')

const modelValue = defineModel<boolean>({default: false})

const openInParent = computed(() =>
  isReadOnlyArray(parentData?.openItem.value)
    ? parentData.openItem.value.includes(computedId.value)
    : parentData?.openItem.value === computedId.value
)

const isOpen = computed(() => (parentData ? openInParent.value : modelValue.value))

if (parentData && modelValue.value) {
  parentData.setOpenItem(computedId.value)
}

watch(openInParent, (value) => {
  if (parentData) modelValue.value = value
})

const onToggle = (event: Event) => {
  const open = (event.currentTarget as HTMLDetailsElement).open
  if (open !== isOpen.value) {
    if (open) parentData?.setOpenItem(computedId.value)
    else parentData?.setCloseItem(computedId.value)
    modelValue.value = open
  }
  emit('toggle', event as ToggleEvent)
}
</script>
