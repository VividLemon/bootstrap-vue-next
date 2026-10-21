<template>
  <div :id="computedId" class="accordion" :class="computedClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import {computed, provide, readonly} from 'vue'
import {accordionInjectionKey} from '../../utils/keys'
import {useId} from '../../composables/useId'
import {useDefaults} from '../../composables/useDefaults'
import type {BAccordionSlots, BAccordionProps} from '../../types'
import {isReadOnlyArray} from '../../utils/object'

const _props = withDefaults(defineProps<Omit<BAccordionProps, 'modelValue'>>(), {
  flush: false,
  free: false,
  id: undefined,
})
const props = useDefaults(_props, 'BAccordion')
defineSlots<BAccordionSlots>()

const modelValue = defineModel<BAccordionProps['modelValue']>({
  default: undefined,
})

const computedId = useId(() => props.id, 'accordion')

const computedClasses = computed(() => ({
  'accordion-flush': props.flush,
}))

provide(accordionInjectionKey, {
  openItem: readonly(modelValue),
  // Native `<details>` elements sharing a `name` are exclusive
  name: computed(() => (props.free ? undefined : computedId.value)),
  setOpenItem: (id: string) => {
    if (props.free) {
      if (isReadOnlyArray(modelValue.value)) {
        if (!modelValue.value.includes(id)) modelValue.value = [...modelValue.value, id]
      } else {
        modelValue.value = modelValue.value === undefined ? [id] : [modelValue.value, id]
      }
      return
    }
    modelValue.value = id
  },
  setCloseItem: (id: string) => {
    if (isReadOnlyArray(modelValue.value)) {
      const next = modelValue.value.filter((item) => item !== id)
      modelValue.value = next.length ? next : undefined
    } else if (modelValue.value === id) {
      modelValue.value = undefined
    }
  },
})
</script>
