<template>
  <li :class="liClasses" v-bind="wrapperAttrs">
    <BForm
      v-bind="processedAttrs.formAttrs"
      :id="props.id"
      :floating="props.floating"
      :role="props.role"
      :novalidate="props.novalidate"
      :validated="props.validated"
      class="d-flex"
      :class="props.formClass"
      @submit.prevent="submitted"
    >
      <slot />
    </BForm>
  </li>
</template>

<script setup lang="ts">
import {computed, useAttrs} from 'vue'
import {useDefaults} from '../../composables/useDefaults'
import type {BNavFormProps} from '../../types/ComponentProps'
import BForm from '../BForm/BForm.vue'
import type {BNavFormEmits, BNavFormSlots} from '../../types'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<BNavFormProps>(), {
  role: undefined,
  wrapperAttrs: undefined,
  formClass: undefined,
  // BForm props
  floating: undefined,
  id: undefined,
  novalidate: undefined,
  validated: undefined,
  // End BForm props
})
const props = useDefaults(_props, 'BNavForm')
const emit = defineEmits<BNavFormEmits>()
defineSlots<BNavFormSlots>()
const attrs = useAttrs()

const processedAttrs = computed(() => {
  const {class: wrapperClass, ...formAttrs} = attrs
  return {wrapperClass, formAttrs}
})

const submitted = (e: Readonly<Event>) => {
  emit('submit', e)
}

const liClasses = computed(() => [
  'd-flex',
  'flex-row',
  'align-items-center',
  'flex-wrap',
  processedAttrs.value.wrapperClass,
])
</script>
