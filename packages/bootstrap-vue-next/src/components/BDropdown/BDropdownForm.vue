<template>
  <li role="presentation" :class="processedAttrs.wrapperClass" v-bind="props.wrapperAttrs">
    <form
      class="dropdown-item-text"
      :class="computedClasses"
      :novalidate="props.novalidate"
      :data-bs-validate="computedValidate"
      v-bind="processedAttrs.formAttrs"
    >
      <slot />
    </form>
  </li>
</template>

<script setup lang="ts">
import {computed, useAttrs} from 'vue'
import {useDefaults} from '../../composables/useDefaults'
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

const computedClasses = computed(() => [props.formClass])

// `data-bs-validate` opts in to `:user-invalid` styling; `="valid"` also shows `:user-valid`
const computedValidate = computed(() =>
  props.validate === 'valid' ? 'valid' : props.validate === true ? '' : undefined
)
</script>
