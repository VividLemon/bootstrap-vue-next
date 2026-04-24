<template>
  <BCol
    v-if="isHorizontal"
    v-bind="labelColProps"
    :id="labelId"
    :tag="labelTag"
    :for="computedLabelFor || null"
    :tabindex="isFieldset ? '-1' : null"
    :class="[labelAlignClasses, labelClasses]"
    @click="isFieldset ? onLegendClick : undefined"
  >
    <slot name="label">{{ label }}</slot>
  </BCol>
  <component
    :is="labelTag"
    v-else
    :id="labelId"
    :for="computedLabelFor || null"
    :tabindex="isFieldset ? '-1' : null"
    :class="labelClasses"
    @click="isFieldset ? onLegendClick : undefined"
  >
    <slot name="label">{{ label }}</slot>
  </component>
</template>

<script setup lang="ts">
import type {ClassValue} from '../types/AnyValuedAttributes'
import BCol from './BContainer/BCol.vue'

defineProps<{
  label: string | undefined
  labelTag: string
  labelId: string | undefined
  computedLabelFor: string | null
  isFieldset: boolean
  isHorizontal: boolean
  labelColProps: Record<string, unknown>
  labelAlignClasses: string[]
  labelClasses: ClassValue
  onLegendClick: (event: MouseEvent) => void
}>()

defineSlots<{
  label?: () => unknown
}>()
</script>
