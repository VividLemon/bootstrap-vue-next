<template>
  <component :is="resolvedProps.button ? 'label' : 'div'" :class="computedWrapperClasses">
    <input
      :id="computedId"
      v-bind="$attrs"
      ref="_input"
      v-model="localValue"
      :class="inputClasses"
      type="radio"
      :disabled="props.disabled || parentData?.disabled.value || formGroupData?.disabled.value"
      :required="computedRequired || undefined"
      :name="props.name || parentData?.name.value"
      :form="props.form || parentData?.form.value"
      :aria-label="props.ariaLabel"
      :aria-labelledby="props.ariaLabelledby"
      :value="props.value"
      :aria-required="computedRequired || undefined"
    />
    <slot v-if="resolvedProps.button" />
    <label v-else-if="hasOwnLabel" :for="computedId">
      <slot />
    </label>
  </component>
</template>

<script setup lang="ts">
import {useFocus} from '@vueuse/core'
import {computed, inject, useTemplateRef} from 'vue'
import {resolvePartColor} from '../../composables/useThemeClasses'
import {
  useFormCheckClasses,
  useFormCheckInputClasses,
  useFormCheckLabelClasses,
} from '../../composables/useFormCheck'
import {isEmptySlot} from '../../utils/dom'
import {useDefaults} from '../../composables/useDefaults'
import {useId} from '../../composables/useId'
import {formGroupKey, radioGroupKey} from '../../utils/keys'
import type {BFormRadioProps, BFormRadioSlots, RadioValue} from '../../types'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<Omit<BFormRadioProps, 'modelValue'>>(), {
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  autofocus: false,
  button: undefined,
  buttonVariant: undefined,
  buttonColor: undefined,
  disabled: false,
  form: undefined,
  id: undefined,
  name: undefined,
  plain: undefined,
  required: false,
  size: undefined,
  state: undefined,
  value: true,
})
const props = useDefaults(_props, 'BFormRadio')
const slots = defineSlots<BFormRadioSlots>()

const modelValue = defineModel<BFormRadioProps['modelValue']>({
  default: undefined,
})

const computedId = useId(() => props.id, 'form-check')

const parentData = inject(radioGroupKey, null)

const input = useTemplateRef('_input')

const {focused} = useFocus(input, {
  initialValue: props.autofocus,
})

const hasDefaultSlot = computed(() => !isEmptySlot(slots.default))

// True default values for props that are undefined to support inheritance
const propDefaults = {
  plain: false,
  button: false,
  size: undefined,
  buttonVariant: 'solid' as const,
  buttonColor: {theme: 'secondary' as const},
  state: null,
}

// Single source of truth for resolved prop values with parent inheritance and defaults
const resolvedProps = computed(() => ({
  plain: props.plain ?? parentData?.plain.value ?? propDefaults.plain,
  button: props.button ?? parentData?.buttons.value ?? propDefaults.button,
  state: props.state ?? parentData?.state.value ?? propDefaults.state,
  size: props.size ?? parentData?.size.value ?? propDefaults.size,
  buttonVariant:
    props.buttonVariant ?? parentData?.buttonVariant.value ?? propDefaults.buttonVariant,
  buttonColor: resolvePartColor(
    props.buttonColor,
    parentData?.buttonColor.value ?? propDefaults.buttonColor
  ),
}))

// Shorthand for template usage
const resolvedPlain = computed(() => resolvedProps.value.plain)
const hasOwnLabel = computed(() => hasDefaultSlot.value || !resolvedPlain.value)

const labelTargetId = computed(() => (hasOwnLabel.value ? null : computedId.value))
const formGroupData = inject(formGroupKey, null)?.()
formGroupData?.track(labelTargetId)

const localValue = computed({
  get: () => (parentData ? parentData.modelValue.value : modelValue.value),
  set: (newValue) => {
    if (newValue === undefined) return
    if (parentData !== null) {
      parentData.modelValue.value = newValue as RadioValue
      return
    }
    modelValue.value = newValue as RadioValue
  },
})

const computedRequired = computed(
  () => !!(props.name ?? parentData?.name.value) && (props.required || parentData?.required.value)
)

const classesObject = computed(() => ({
  ...resolvedProps.value,
  type: 'radio' as const,
  hasDefaultSlot: hasDefaultSlot.value,
}))
const {classes: wrapperClasses} = useFormCheckClasses(classesObject)
const {classes: labelClasses} = useFormCheckLabelClasses(classesObject)
const computedWrapperClasses = computed(() =>
  resolvedProps.value.button ? labelClasses.value : wrapperClasses.value
)
const {classes: inputClasses} = useFormCheckInputClasses(classesObject)

defineExpose({
  blur: () => {
    focused.value = false
  },
  element: input,
  focus: () => {
    focused.value = true
  },
})
</script>
