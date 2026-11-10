<template>
  <BFormCheckboxGroupBase
    ref="_base"
    v-bind="forwardedProps"
    v-model="modelValue as unknown as CheckboxValue[]"
    :options="normalizedOptions"
  >
    <!-- Forward all slots -->
    <template #first>
      <slot name="first" />
    </template>

    <template #option="slotProps">
      <slot name="option" v-bind="slotProps" />
    </template>

    <slot />
  </BFormCheckboxGroupBase>
</template>

<script
  setup
  lang="ts"
  generic="
    Options extends readonly (object | string | number | boolean)[] = readonly (
      object | string | number | boolean
    )[]
  "
>
import {resolveOptionFields} from '../../composables/useFormSelect'
import type {
  BFormCheckboxGroupExposes,
  BFormCheckboxGroupProps,
  BFormCheckboxGroupSlots,
  CheckboxValue,
  OptionsValues,
} from '../../types'
import {computed, useTemplateRef} from 'vue'
import BFormCheckboxGroupBase from './BFormCheckboxGroupBase.vue'

/**
 * Type-safe wrapper component for BFormCheckboxGroup.
 * Provides generic type safety for options array and strongly-typed modelValue.
 * Uses Options array generic to extract union of all possible values.
 * Supports both complex objects and simple scalar types (string, number, boolean).
 *
 * For strongly-typed modelValue:
 * - Primitive arrays: modelValue is array of those value types
 * - Object arrays with 'value' field: modelValue is array of value field types
 * - Use 'as const' on options for literal type inference
 */

// Generic props - type safety happens here
const props = withDefaults(defineProps<Omit<BFormCheckboxGroupProps<Options>, 'modelValue'>>(), {
  fields: undefined,
  ariaInvalid: undefined,
  autofocus: false,
  buttonVariant: 'solid',
  buttonColor: undefined,
  buttons: false,
  disabled: false,
  form: undefined,
  id: undefined,
  name: undefined,
  options: () => [] as unknown as Options,
  plain: false,
  required: false,
  size: undefined,
  stacked: false,
  state: null,
  switches: false,
})
const optionFields = computed(() => resolveOptionFields(props.fields))
defineSlots<BFormCheckboxGroupSlots>()

// Type-safe model value - extracts union from options, wraps in array.
// NOTE: OptionsValues assumes a static "value" key; custom valueField is not
// reflected in the type — modelValue falls back to unknown in that case.
const modelValue = defineModel<OptionsValues<Options>[] | undefined>({
  default: () => [],
})

// Type-safe normalization of options
const normalizedOptions = computed(() =>
  (props.options ?? []).map(
    (el) =>
      (typeof el === 'string' || typeof el === 'number' || typeof el === 'boolean'
        ? {
            value: el,
            disabled: props.disabled,
            text: el.toString(),
          }
        : {
            value: (el as Record<string, unknown>)[optionFields.value.valueField],
            disabled:
              props.disabled ||
              (((el as Record<string, unknown>)[optionFields.value.disabledField] as
                boolean | undefined) ??
                false),
            text:
              ((el as Record<string, unknown>)[optionFields.value.textField] as
                string | undefined) ??
              String((el as Record<string, unknown>)[optionFields.value.valueField]),
          }) as {text: string; value: CheckboxValue; disabled: boolean}
  )
)

// Forward all non-option-related props
const forwardedProps = computed(() => ({
  id: props.id,
  name: props.name,
  size: props.size,
  state: props.state,
  buttonVariant: props.buttonVariant,
  buttonColor: props.buttonColor,
  buttons: props.buttons,
  stacked: props.stacked,
  disabled: props.disabled,
  required: props.required,
  autofocus: props.autofocus,
  form: props.form,
  ariaInvalid: props.ariaInvalid,
  plain: props.plain,
  switches: props.switches,
}))

const base = useTemplateRef('_base')
defineExpose({
  blur: () => {
    base?.value?.blur()
  },
  focus: () => {
    base?.value?.focus()
  },
} satisfies BFormCheckboxGroupExposes)
</script>
