<template>
  <select
    :id="computedId"
    ref="_input"
    v-model="localValue"
    :class="computedClasses"
    :name="props.name"
    :form="props.form || undefined"
    :multiple="props.multiple || undefined"
    :size="computedSelectSize"
    :disabled="isDisabled"
    :required="props.required || undefined"
    :aria-required="props.required || undefined"
    :aria-invalid="computedAriaInvalid"
  >
    <slot name="first" />
    <template v-for="(option, index) in normalizedOptsWrapper" :key="index">
      <BFormSelectOptionGroup
        v-if="isComplex(option)"
        :label="option.label"
        :options="option.options"
        :fields="props.fields"
      />
      <BFormSelectOption v-else v-bind="option">
        <slot name="option" v-bind="option">
          {{ option.text }}
        </slot>
      </BFormSelectOption>
    </template>
    <slot />
  </select>
</template>

<script setup lang="ts">
import type {BFormSelectExposes, BFormSelectBaseProps} from '../../types'
import {computed, inject, provide, readonly, useTemplateRef} from 'vue'
import BFormSelectOption from './BFormSelectOption.vue'
import BFormSelectOptionGroup from './BFormSelectOptionGroup.vue'
import {useAriaInvalid} from '../../composables/useAriaInvalid'
import {useFocus, useToNumber} from '@vueuse/core'
import {useDefaults} from '../../composables/useDefaults'
import {useId} from '../../composables/useId'
import {useStateClass} from '../../composables/useStateClass'
import {useFormSelect, resolveOptionFields} from '../../composables/useFormSelect'
import {formGroupKey, formSelectKey} from '../../utils/keys'

/**
 * Base component for BFormSelect - non-generic implementation using useDefaults.
 * Renders a select element with normalized options and option groups.
 * Supports both simple options and complex grouped options.
 */
const _props = withDefaults(defineProps<Omit<BFormSelectBaseProps, 'modelValue'>>(), {
  fields: undefined,
  ariaInvalid: undefined,
  autofocus: false,
  disabled: false,
  form: undefined,
  id: undefined,
  multiple: false,
  name: undefined,
  options: () => [],
  required: false,
  selectSize: 0,
  size: undefined,
  state: null,
})
const props = useDefaults(_props, 'BFormSelect')
const optionFields = computed(() => resolveOptionFields(props.fields))

const modelValue = defineModel<BFormSelectBaseProps['modelValue']>({
  default: '',
})

const computedId = useId(() => props.id, 'input')

const formGroupData = inject(formGroupKey, null)?.()
formGroupData?.track(computedId)
const isDisabled = computed(() => props.disabled || (formGroupData?.disabled.value ?? false))

const selectSizeNumber = useToNumber(() => props.selectSize)

const {stateClass} = useStateClass(() => props.state)

const input = useTemplateRef('_input')

const {focused} = useFocus(input, {
  initialValue: props.autofocus,
})

const computedClasses = computed(() => [
  stateClass.value,
  'form-control',
  {
    [`form-control-${props.size}`]: props.size !== undefined,
  },
])

const computedSelectSize = computed(() =>
  selectSizeNumber.value > 0 ? selectSizeNumber.value : undefined
)

const {ariaInvalid: computedAriaInvalid} = useAriaInvalid(
  () => props.ariaInvalid,
  () => props.state
)

const {normalizedOptions, isComplex} = useFormSelect(() => props.options, optionFields)

const normalizedOptsWrapper = computed(() => normalizedOptions.value)

const localValue = computed({
  get: () => modelValue.value,
  set: (newValue) => {
    modelValue.value = newValue
  },
})

// Provide the current model value for child components to inject
provide(formSelectKey, {
  modelValue: readonly(localValue),
})

defineExpose({
  blur: () => {
    focused.value = false
  },
  element: input,
  focus: () => {
    focused.value = true
  },
} satisfies BFormSelectExposes)
</script>
