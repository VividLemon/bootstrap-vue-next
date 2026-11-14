<template>
  <li :class="liClasses" v-bind="wrapperAttrs">
    <BForm
      :id="props.id"
      :floating="props.floating"
      :role="props.role"
      :novalidate="props.novalidate"
      :validated="props.validated"
      class="d-flex"
      v-bind="formAttrs"
      @submit.prevent="submitted"
    >
      <slot />
    </BForm>
  </li>
</template>

<script setup lang="ts">
import {computed, mergeProps, useAttrs} from 'vue'
import {useDefaults} from '../../composables/useDefaults'
import BForm from '../BForm/BForm.vue'
import type {BNavFormEmits, BNavFormProps, BNavFormSlots} from '../../types'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<BNavFormProps>(), {
  role: undefined,
  wrapperAttrs: undefined,
  formAttrs: undefined,
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

// Fallthrough attrs (except `class`, which goes to the wrapper) and `formAttrs` both go to the form.
// An element takes one `v-bind` object, so they are merged here; it is bound after the form props,
// so a key in `formAttrs` wins over the matching top-level prop
const formAttrs = computed(() => mergeProps(processedAttrs.value.formAttrs, props.formAttrs ?? {}))

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
