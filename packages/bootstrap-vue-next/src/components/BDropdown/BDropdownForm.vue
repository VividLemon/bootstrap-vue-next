<template>
  <li role="presentation" :class="processedAttrs.wrapperClass" v-bind="props.wrapperAttrs">
    <form
      class="dropdown-item-text"
      :class="props.formClass"
      :novalidate="props.novalidate"
      :data-bs-validate="validateAttr"
      v-bind="processedAttrs.formAttrs"
    >
      <slot />
    </form>
  </li>
</template>

<script setup lang="ts">
import {computed, useAttrs} from 'vue'
import {useDefaults} from '../../composables/useDefaults'
import {useFormValidate} from '../../composables/useFormValidate'
import type {BDropdownFormProps, BDropdownFormSlots} from '../../types'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<BDropdownFormProps>(), {
  formClass: undefined,
  novalidate: undefined,
  validate: undefined,
  wrapperAttrs: undefined,
})
const props = useDefaults(_props, 'BDropdownForm')
defineSlots<BDropdownFormSlots>()
const attrs = useAttrs()

const processedAttrs = computed(() => {
  const {class: wrapperClass, ...formAttrs} = attrs
  return {wrapperClass, formAttrs}
})

const {validateAttr} = useFormValidate(() => props.validate)
</script>
