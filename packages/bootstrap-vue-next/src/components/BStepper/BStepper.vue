<template>
  <div v-if="props.overflow" class="stepper-overflow">
    <component :is="props.tag" class="stepper" :class="computedClasses" v-bind="$attrs">
      <slot />
    </component>
  </div>
  <component :is="props.tag" v-else class="stepper" :class="computedClasses" v-bind="$attrs">
    <slot />
  </component>
</template>

<script setup lang="ts">
import {computed, onMounted, onUpdated, provide, type Ref, shallowRef, toRef} from 'vue'
import {stepperInjectionKey} from '../../utils/keys'
import {useDefaults} from '../../composables/useDefaults'
import {sortSlotElementsByPosition} from '../../utils/dom'
import type {BStepperProps, BStepperSlots} from '../../types'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<Omit<BStepperProps, 'modelValue'>>(), {
  horizontal: false,
  overflow: false,
  tag: 'ol',
})
const props = useDefaults(_props, 'BStepper')
defineSlots<BStepperSlots>()

const modelValue = defineModel<BStepperProps['modelValue']>({
  default: undefined,
})

const computedClasses = computed(() => ({
  'stepper-horizontal': props.horizontal === true,
  [`${props.horizontal}:stepper-horizontal`]: typeof props.horizontal === 'string',
}))

interface StepperItem {
  key: symbol
  el: Readonly<Ref<HTMLElement | null>>
}

// Items register during setup, so the order is the render order on the server and the client.
// After mount and updates the order is re-read from the DOM (reordered `v-for` lists).
const items = shallowRef<readonly StepperItem[]>([])

const sortItems = () => {
  const sorted = [...items.value].sort((a, b) => sortSlotElementsByPosition(a.el.value, b.el.value))
  if (sorted.some((item, i) => item !== items.value[i])) items.value = sorted
}
onMounted(sortItems)
onUpdated(sortItems)

provide(stepperInjectionKey, {
  step: toRef(() => modelValue.value),
  register: (key, el) => {
    items.value = [...items.value, {key, el}]
  },
  unregister: (key) => {
    items.value = items.value.filter((item) => item.key !== key)
  },
  indexOf: (key) => items.value.findIndex((item) => item.key === key),
})
</script>
