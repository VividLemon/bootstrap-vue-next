<template>
  <div v-bind="props.wrapperAttrs" :class="wrapperClasses" :style="wrapperStyle">
    <input
      :id="computedId"
      ref="_input"
      v-bind="$attrs"
      type="range"
      :class="inputClasses"
      :value="modelValue"
      :name="props.name || undefined"
      :form="props.form || undefined"
      :min="minNumber"
      :max="maxNumber"
      :step="props.step"
      :disabled="isDisabled"
      :required="props.required || undefined"
      :list="resolvedTicks.length > 0 ? listId : undefined"
      :aria-required="props.required || undefined"
      :aria-invalid="computedAriaInvalid"
      :aria-valuetext="props.formatter !== undefined ? formattedValue : undefined"
      @input="onInput"
      @change="onChange"
    />
    <output
      v-if="props.bubble"
      class="form-range-bubble tooltip bs-tooltip-top show"
      aria-hidden="true"
    >
      <div class="tooltip-arrow" />
      <div class="tooltip-inner">{{ formattedValue }}</div>
    </output>
    <template v-if="resolvedTicks.length > 0">
      <div class="form-range-ticks" aria-hidden="true" :style="ticksStyle">
        <span
          v-for="(tick, index) in resolvedTicks"
          :key="index"
          class="form-range-tick"
          :style="{gridColumnStart: String(index + 2)}"
        >
          <span v-if="tick.label" class="form-range-tick-label">{{ tick.label }}</span>
        </span>
      </div>
      <datalist :id="listId">
        <option
          v-for="(tick, index) in resolvedTicks"
          :key="index"
          :value="tick.value"
          :label="tick.label"
        />
      </datalist>
    </template>
  </div>
</template>

<script setup lang="ts">
import {computed, inject, useTemplateRef} from 'vue'
import {useToNumber} from '@vueuse/core'
import type {BFormRangeEmits, BFormRangeProps} from '../../types'
import {useDefaults} from '../../composables/useDefaults'
import {useId} from '../../composables/useId'
import {useAriaInvalid} from '../../composables/useAriaInvalid'
import {useStateClass} from '../../composables/useStateClass'
import {resolvePartColor, useThemeClasses} from '../../composables/useThemeClasses'
import {formGroupKey} from '../../utils/keys'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<Omit<BFormRangeProps, 'modelValue'>>(), {
  ariaInvalid: undefined,
  bubble: false,
  color: undefined,
  disabled: false,
  form: undefined,
  formatter: undefined,
  id: undefined,
  max: 100,
  min: 0,
  name: undefined,
  required: false,
  state: undefined,
  step: 1,
  ticks: undefined,
  wrapperAttrs: undefined,
})
const props = useDefaults(_props, 'BFormRange')

const emit = defineEmits<BFormRangeEmits>()

const modelValue = defineModel<Exclude<BFormRangeProps['modelValue'], undefined>>({
  default: 50,
})

const input = useTemplateRef('_input')

const computedId = useId(() => props.id, 'range')
const listId = computed(() => `${computedId.value}__ticks`)

// Lets an ancestor BFormField point its label at this input and pass down state / disabled
const formGroupData = inject(formGroupKey, null)?.()
formGroupData?.track(computedId)
const computedState = computed(() =>
  props.state !== undefined ? props.state : (formGroupData?.state.value ?? null)
)
const isDisabled = computed(() => props.disabled || (formGroupData?.disabled.value ?? false))
const {ariaInvalid: computedAriaInvalid} = useAriaInvalid(() => props.ariaInvalid, computedState)
const {stateClass} = useStateClass(computedState)

const minNumber = useToNumber(() => props.min ?? 0)
const maxNumber = useToNumber(() => props.max ?? 100)

const format = (value: number) =>
  props.formatter !== undefined ? props.formatter(value) : String(value)

const formattedValue = computed(() => format(modelValue.value))

const clampRatio = (value: number) => Math.min(Math.max(value, 0), 1)

// Same math as Bootstrap's range.ts, computed here so the fill also renders on the server
const fill = computed(() => {
  const span = maxNumber.value - minNumber.value
  return span > 0 ? clampRatio((modelValue.value - minNumber.value) / span) : 0
})

const resolvedTicks = computed(() =>
  (props.ticks ?? [])
    .map((tick) => {
      const value = typeof tick === 'number' ? tick : tick.value
      const label =
        typeof tick === 'number' || tick.label === undefined ? format(value) : tick.label
      return {value, label}
    })
    .filter((tick) => !Number.isNaN(tick.value))
    .sort((a, b) => a.value - b.value)
)

// Columns are the gaps between 0, each tick and 1, so every tick lands on a grid line
const ticksStyle = computed(() => {
  const span = maxNumber.value - minNumber.value || 1
  const stops = [
    0,
    ...resolvedTicks.value.map((tick) => clampRatio((tick.value - minNumber.value) / span)),
    1,
  ]
  return {
    gridTemplateColumns: stops
      .slice(1)
      .map((stop, index) => `${stop - (stops[index] ?? 0)}fr`)
      .join(' '),
  }
})

const computedColor = computed(() => resolvePartColor(props.color, {}))
const {classes: colorClasses} = useThemeClasses(() => ({theme: computedColor.value.theme}))

const wrapperClasses = computed(() => ['form-range', colorClasses.value])
const wrapperStyle = computed(() => ({'--bs-range-fill': `${fill.value}`}))
const inputClasses = computed(() => ['form-range-input', stateClass.value])

const readValue = (evt: Readonly<Event>) =>
  Number.parseFloat((evt.target as HTMLInputElement).value)

const onInput = (evt: Readonly<Event>) => {
  const value = readValue(evt)
  if (Number.isNaN(value)) return
  modelValue.value = value
}

const onChange = (evt: Readonly<Event>) => {
  const value = readValue(evt)
  if (Number.isNaN(value)) return
  modelValue.value = value
  emit('change', value)
}

const focus = () => {
  input.value?.focus()
}

const blur = () => {
  input.value?.blur()
}

defineExpose({
  blur,
  element: input,
  focus,
})
</script>
