<template>
  <input
    :id="computedId"
    ref="input"
    :value="computedValue"
    :class="computedClasses"
    :name="props.name || undefined"
    :form="props.form || undefined"
    :type="props.type"
    :disabled="isDisabled"
    :placeholder="props.placeholder"
    :required="props.required || undefined"
    :autocomplete="props.autocomplete || undefined"
    :readonly="props.readonly || props.plaintext"
    :min="props.min"
    :max="props.max"
    :step="props.step"
    :list="props.type !== 'password' ? props.list : undefined"
    :aria-required="props.required || undefined"
    :aria-invalid="computedAriaInvalid"
    @input="onInput"
    @change="onChange"
    @blur="onBlur"
  />
</template>

<script setup lang="ts">
import {computed, useTemplateRef} from 'vue'
import {useDefaults} from '../../composables/useDefaults'
import {normalizeInput} from '../../utils/normalizeInput'
import type {BFormInputProps} from '../../types'
import {useFormInput} from '../../composables/useFormInput'

const _props = withDefaults(defineProps<Omit<BFormInputProps, 'modelValue'>>(), {
  max: undefined,
  min: undefined,
  step: undefined,
  type: 'text',
  // CommonInputProps
  ariaInvalid: undefined,
  autocomplete: undefined,
  autofocus: false,
  debounce: 0,
  debounceMaxWait: Number.NaN,
  disabled: false,
  form: undefined,
  formatter: undefined,
  id: undefined,
  lazyFormatter: false,
  list: undefined,
  modelValue: '',
  name: undefined,
  placeholder: undefined,
  plaintext: false,
  readonly: false,
  required: false,
  size: undefined,
  state: undefined,
  // End CommonInputProps
})
const props = useDefaults(_props, 'BFormInput')

const [modelValue, modelModifiers] = defineModel<
  Exclude<BFormInputProps['modelValue'], undefined>,
  'trim' | 'lazy' | 'number'
>({
  default: '',
  set: (v) => normalizeInput(v, modelModifiers),
})

const input = useTemplateRef('input')

const {
  computedId,
  computedAriaInvalid,
  computedValue,
  onInput,
  onChange,
  onBlur,
  stateClass,
  focus,
  blur,
  isDisabled,
} = useFormInput(props, input, modelValue, modelModifiers)

const computedClasses = computed(() => {
  const isColor = props.type === 'color'
  return [
    stateClass.value,
    {
      'form-control': isColor || !props.plaintext,
      'form-control-color': isColor,
      'form-control-plaintext': props.plaintext && !isColor,
      [`form-control-${props.size}`]: !!props.size,
    },
  ]
})

defineExpose({
  blur,
  element: input,
  flushDebounce: onBlur,
  focus,
})
</script>
