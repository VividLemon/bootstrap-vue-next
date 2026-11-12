<template>
  <li :class="liClasses" v-bind="wrapperAttrs">
    <BForm v-bind="formBindings" class="d-flex" @submit.prevent="submitted">
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

// The top-level form props win over `formAttrs`, but only when they are set: an unset prop must
// not clear the same attribute passed through `formAttrs` (for example `id` or `role`)
const formBindings = computed(() => {
  const ownProps = Object.fromEntries(
    Object.entries({
      id: props.id,
      floating: props.floating,
      role: props.role,
      novalidate: props.novalidate,
      validated: props.validated,
    }).filter(([, value]) => value !== undefined)
  )
  return mergeProps(processedAttrs.value.formAttrs, props.formAttrs ?? {}, ownProps)
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
