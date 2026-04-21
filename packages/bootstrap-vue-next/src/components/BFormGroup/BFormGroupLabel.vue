<template>
  <template v-if="hasLabelSlot || label || isHorizontal">
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
</template>

<script setup lang="ts">
import {computed, useSlots} from 'vue'
import type {ClassValue} from '../../types/AnyValuedAttributes'
import BCol from '../BContainer/BCol.vue'

defineProps<{
  label?: string
  labelTag: string
  labelId?: string
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

const slots = useSlots()
const hasLabelSlot = computed(() => !!slots['label'])
</script>
