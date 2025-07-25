<template>
  <div
    v-bind="computedAttrs"
    :id="computedId"
    ref="_element"
    role="group"
    :class="computedClasses"
    class="bv-no-focus-ring"
    tabindex="-1"
  >
    <slot name="first" />
    <BFormCheckbox v-for="(item, index) in normalizeOptions" :key="index" v-bind="item">
      <slot name="option" v-bind="item">
        {{ item.text }}
      </slot>
    </BFormCheckbox>
    <slot />
  </div>
</template>

<script setup lang="ts">
import {computed, provide, toRef, useTemplateRef} from 'vue'
import BFormCheckbox from './BFormCheckbox.vue'
import {checkboxGroupKey} from '../../utils/keys'
import {useFocus} from '@vueuse/core'
import type {BFormCheckboxGroupProps} from '../../types/ComponentProps'
import {useDefaults} from '../../composables/useDefaults'
import {useId} from '../../composables/useId'
import {getGroupAttr, getGroupClasses} from '../../composables/useFormCheck'
import type {BFormCheckboxGroupSlots} from '../../types'

const _props = withDefaults(defineProps<Omit<BFormCheckboxGroupProps, 'modelValue'>>(), {
  ariaInvalid: undefined,
  autofocus: false,
  buttonVariant: 'secondary',
  buttons: false,
  disabled: false,
  disabledField: 'disabled',
  form: undefined,
  id: undefined,
  name: undefined,
  options: () => [],
  plain: false,
  required: false,
  reverse: false,
  size: 'md',
  stacked: false,
  state: null,
  switches: false,
  textField: 'text',
  validated: false,
  valueField: 'value',
})
const props = useDefaults(_props, 'BFormCheckboxGroup')
defineSlots<BFormCheckboxGroupSlots>()

const modelValue = defineModel<Exclude<BFormCheckboxGroupProps['modelValue'], undefined>>({
  default: () => [],
})

const computedId = useId(() => props.id, 'checkbox')
const computedName = useId(() => props.name, 'checkbox')

const element = useTemplateRef('_element')

const {focused} = useFocus(element, {
  initialValue: props.autofocus,
})

provide(checkboxGroupKey, {
  modelValue,
  switch: toRef(() => props.switches),
  buttonVariant: toRef(() => props.buttonVariant),
  form: toRef(() => props.form),
  name: computedName,
  state: toRef(() => props.state),
  plain: toRef(() => props.plain),
  size: toRef(() => props.size),
  inline: toRef(() => !props.stacked),
  reverse: toRef(() => props.reverse),
  required: toRef(() => props.required),
  buttons: toRef(() => props.buttons),
  disabled: toRef(() => props.disabled),
})

const normalizeOptions = computed<
  {
    text: string | undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
    disabled: boolean | undefined
    [key: string]: unknown
  }[]
>(() =>
  props.options.map((el) =>
    typeof el === 'string' || typeof el === 'number'
      ? {
          value: el,
          disabled: props.disabled,
          text: el.toString(),
        }
      : {
          ...el,
          value: el[props.valueField],
          disabled: el[props.disabledField] as boolean | undefined,
          text: el[props.textField] as string | undefined,
        }
  )
)

const classesObject = computed(() => ({
  required: props.required,
  ariaInvalid: props.ariaInvalid,
  state: props.state,
  validated: props.validated,
  buttons: props.buttons,
  stacked: props.stacked,
  size: props.size,
}))
const computedAttrs = getGroupAttr(classesObject)
const computedClasses = getGroupClasses(classesObject)

defineExpose({
  blur: () => {
    focused.value = false
  },
  focus: () => {
    focused.value = true
  },
})
</script>
