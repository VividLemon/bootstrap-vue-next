<template>
  <label
    v-if="hasLabelSlot || props.label"
    class="form-label"
    :class="props.labelClass"
    :for="computedId"
  >
    <slot name="label">
      {{ props.label }}
    </slot>
  </label>

  <input
    :id="computedId"
    v-bind="$attrs"
    ref="_input"
    type="file"
    :class="computedClasses"
    :form="props.form"
    :name="props.name"
    :multiple="props.multiple"
    :disabled="props.disabled"
    :capture="props.capture"
    :accept="computedAccept || undefined"
    :required="props.required || undefined"
    :aria-label="props.ariaLabel"
    :aria-labelledby="props.ariaLabelledby"
    :aria-required="props.required || undefined"
    :directory="props.directory"
    :webkitdirectory="props.directory"
    @change="onChange"
    @drop="onDrop"
  />
</template>

<script setup lang="ts">
import {useFocus} from '@vueuse/core'
import {computed, useTemplateRef, watch} from 'vue'
import type {BFormFileProps} from '../../types/ComponentProps'
import {useDefaults} from '../../composables/useDefaults'
import {useId} from '../../composables/useId'
import {useStateClass} from '../../composables/useStateClass'
import {isEmptySlot} from '../../utils/dom'
import type {BFormFileSlots} from '../../types'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<Omit<BFormFileProps, 'modelValue'>>(), {
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  accept: '',
  autofocus: false,
  capture: undefined,
  directory: false,
  disabled: false,
  form: undefined,
  id: undefined,
  label: '',
  labelClass: undefined,
  multiple: false,
  name: undefined,
  noButton: false,
  noDrop: false,
  noTraverse: false,
  plain: false,
  required: false,
  size: undefined,
  state: null,
})
const props = useDefaults(_props, 'BFormFile')
const slots = defineSlots<BFormFileSlots>()

const modelValue = defineModel<Exclude<BFormFileProps['modelValue'], undefined>>({
  default: null,
})

const computedId = useId(() => props.id)

// TODO noTraverse is not implemented yet

const stateClass = useStateClass(() => props.state)

const input = useTemplateRef('_input')

const {focused} = useFocus(input, {initialValue: props.autofocus})

const hasLabelSlot = computed(() => !isEmptySlot(slots['label']))

const computedAccept = computed(() =>
  typeof props.accept === 'string' ? props.accept : props.accept.join(',')
)

const computedClasses = computed(() => [
  stateClass.value,
  {
    [`form-control-${props.size}`]: props.size !== undefined,
    'form-control': !props.plain,
    'form-control-input-file-hide-button': props.noButton,
  },
])

const onChange = () => {
  const value =
    input.value?.files === null || input.value?.files === undefined ? null : [...input.value.files]
  modelValue.value = value === null ? null : props.multiple === true ? value : value[0]
}

const onDrop = (e: Readonly<Event>) => {
  if (props.noDrop === true) {
    e.preventDefault()
  }
}

/**
 * Reset the form input
 */
const reset = () => {
  modelValue.value = null
}

watch(modelValue, (newValue) => {
  if (newValue === null && input.value !== null) {
    input.value.value = ''
  }
})

defineExpose({
  blur: () => {
    focused.value = false
  },
  element: input,
  focus: () => {
    focused.value = true
  },
  reset,
})
</script>
