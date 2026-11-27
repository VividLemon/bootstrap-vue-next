<template>
  <form
    :id="props.id"
    ref="element"
    :novalidate="props.novalidate"
    :data-bs-validate="validateAttr"
    :class="computedClasses"
  >
    <slot />
  </form>
</template>

<script setup lang="ts">
import {useDefaults} from '../../composables/useDefaults'
import {computed, useTemplateRef} from 'vue'
import {useFormValidate} from '../../composables/useFormValidate'
import type {BFormProps, BFormSlots} from '../../types'

const _props = withDefaults(defineProps<BFormProps>(), {
  id: undefined,
  floating: false,
  novalidate: false,
  validate: false,
})
const props = useDefaults(_props, 'BForm')
defineSlots<BFormSlots>()

const element = useTemplateRef('element')

const computedClasses = computed(() => ({
  'form-floating': props.floating,
}))

const {validateAttr} = useFormValidate(() => props.validate)

defineExpose({
  element,
})
</script>
