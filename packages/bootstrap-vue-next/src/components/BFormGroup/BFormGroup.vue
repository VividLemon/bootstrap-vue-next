<template>
  <fieldset
    :id="computedId"
    :disabled="props.disabled"
    :aria-invalid="computedAriaInvalid"
    :aria-labelledby="isFieldset && isHorizontal ? labelId : undefined"
    v-bind="$attrs"
    :class="[stateClass, {'form-field': !isHorizontal}]"
    class="b-form-group"
  >
    <!-- End of definitions -->
    <BFormRow v-if="isHorizontal">
      <BFormGroupLabel
        v-if="labelShowing"
        v-bind="labelComponentProps"
        @legend-click="onLegendClick"
      >
        <template v-if="slots.label" #label>
          <slot name="label" />
        </template>
      </BFormGroupLabel>
      <BCol v-bind="contentColProps" ref="_content">
        <slot
          :id="computedId"
          :aria-describedby="computedAriaDescribedby"
          :description-id="descriptionId"
          :label-id="labelId"
        />
        <BFormGroupContent v-bind="contentComponentProps">
          <template v-if="slots['invalid-feedback']" #invalid-feedback>
            <slot name="invalid-feedback" />
          </template>
          <template v-if="slots['valid-feedback']" #valid-feedback>
            <slot name="valid-feedback" />
          </template>
          <template v-if="slots.description" #description>
            <slot name="description" />
          </template>
        </BFormGroupContent>
      </BCol>
    </BFormRow>
    <template v-else>
      <div v-if="isFloating" ref="_content" class="form-floating">
        <BFormGroupLabel
          v-if="labelShowing"
          v-bind="labelComponentProps"
          @legend-click="onLegendClick"
        >
          <template v-if="slots.label" #label>
            <slot name="label" />
          </template>
        </BFormGroupLabel>
        <slot
          :id="computedId"
          :aria-describedby="computedAriaDescribedby"
          :description-id="descriptionId"
          :label-id="labelId"
        />
        <BFormGroupContent v-bind="contentComponentProps">
          <template v-if="slots['invalid-feedback']" #invalid-feedback>
            <slot name="invalid-feedback" />
          </template>
          <template v-if="slots['valid-feedback']" #valid-feedback>
            <slot name="valid-feedback" />
          </template>
          <template v-if="slots.description" #description>
            <slot name="description" />
          </template>
        </BFormGroupContent>
      </div>
      <template v-else>
        <BFormGroupLabel
          v-if="labelShowing"
          v-bind="labelComponentProps"
          @legend-click="onLegendClick"
        >
          <template v-if="slots.label" #label>
            <slot name="label" />
          </template>
        </BFormGroupLabel>
        <slot
          :id="computedId"
          :aria-describedby="computedAriaDescribedby"
          :description-id="descriptionId"
          :label-id="labelId"
        />
        <BFormGroupContent v-bind="contentComponentProps">
          <template v-if="slots['invalid-feedback']" #invalid-feedback>
            <slot name="invalid-feedback" />
          </template>
          <template v-if="slots['valid-feedback']" #valid-feedback>
            <slot name="valid-feedback" />
          </template>
          <template v-if="slots.description" #description>
            <slot name="description" />
          </template>
        </BFormGroupContent>
      </template>
    </template>
  </fieldset>
</template>

<script setup lang="ts">
import {computed, toRef, useTemplateRef} from 'vue'
import {useAriaInvalid} from '../../composables/useAriaInvalid'
import {attemptFocus, isVisible} from '../../utils/dom'
import BCol from '../BContainer/BCol.vue'
import BFormRow from '../BForm/BFormRow.vue'
import {getResponsiveClasses, responsiveKeys} from '../../utils/responsive'
import {useStateClass} from '../../composables/useStateClass'
import {useId} from '../../composables/useId'
import type {BFormGroupProps, BFormGroupSlots, ColsValue, Responsive} from '../../types'
import {useDefaults} from '../../composables/useDefaults'
import {useProvideFormGroupData} from '../../composables/useProvideFormGroupData'
import BFormGroupContent from '../BFormGroupContent.vue'
import BFormGroupLabel from '../BFormGroupLabel.vue'

defineOptions({
  inheritAttrs: false,
})

const INPUTS = ['input', 'select', 'textarea']

const _props = withDefaults(defineProps<BFormGroupProps>(), {
  ariaInvalid: undefined,
  contentCols: undefined,
  description: undefined,
  disabled: false,
  feedbackAriaLive: 'assertive',
  floating: false,
  id: undefined,
  invalidFeedback: undefined,
  label: undefined,
  labelAlign: undefined,
  labelAttrs: undefined,
  labelCols: undefined,
  labelFor: undefined,
  labelSize: undefined,
  labelVisuallyHidden: false,
  state: null,
  tooltip: false,
  validFeedback: undefined,
})
const props = useDefaults(_props, 'BFormGroup')
const slots = defineSlots<BFormGroupSlots>()

const computedState = toRef(() => props.state)
const computedDisabled = toRef(() => props.disabled)
const {singleLabelTargetId} = useProvideFormGroupData({
  state: computedState,
  disabled: computedDisabled,
})
const computedLabelFor = computed(() => props.labelFor ?? singleLabelTargetId.value)

/**
 * Keeps only the breakpoints that render a column, so an empty object (or one with only `false`
 * values) does not switch the group into horizontal mode
 */
const getColProps = (value: Readonly<Responsive<ColsValue>> | undefined) => {
  const cols = responsiveKeys.reduce<Responsive<ColsValue>>((result, key) => {
    const entry = value?.[key]
    if (entry !== undefined && entry !== null && entry !== false) result[key] = entry
    return result
  }, {})
  return Object.keys(cols).length > 0 ? {cols} : {}
}

const content = useTemplateRef<HTMLDivElement | InstanceType<typeof BCol> | null>('_content')

const contentColProps = computed(() => getColProps(props.contentCols))
const labelAlignClasses = computed(() => getResponsiveClasses(props.labelAlign, 'text'))
const labelColProps = computed(() => getColProps(props.labelCols))
const isHorizontal = computed(
  () => Object.keys(contentColProps.value).length > 0 || Object.keys(labelColProps.value).length > 0
)
const isFloating = computed(() => props.floating && !isHorizontal.value)

const {stateClass} = useStateClass(computedState)
const {ariaInvalid: computedAriaInvalid} = useAriaInvalid(() => props.ariaInvalid, computedState)

const onLegendClick = (event: Readonly<MouseEvent>) => {
  if (computedLabelFor.value || content.value === null) return

  const {target} = event
  const tagName = target ? (target as HTMLElement).tagName : ''

  if ([...INPUTS, 'a', 'button', 'label'].indexOf(tagName) !== -1) return

  // In horizontal mode, content.value is a BCol component instance, not a DOM element
  // Access the DOM element via $el property
  const contentElement =
    isHorizontal.value && content.value && '$el' in content.value
      ? (content.value.$el as HTMLElement)
      : (content.value as HTMLDivElement | null)
  if (!contentElement) return

  const inputs = [
    ...contentElement.querySelectorAll(INPUTS.map((v) => `${v}:not([disabled])`).join()),
  ].filter(isVisible)
  const [inp] = inputs
  if (inputs.length === 1 && inp instanceof HTMLElement) {
    attemptFocus(inp)
  }
}

const computedId = useId(() => props.id)
const labelId = useId(undefined, '_BV_label_')
const labelTag = computed(() => (!isFieldset.value ? 'label' : 'legend'))
const labelClasses = computed(() => [
  isHorizontal.value ? 'col-form-label' : 'form-label',
  {
    'bv-no-focus-ring': !isFloating.value && !computedLabelFor.value,
    'col-form-label': isHorizontal.value || (!isFloating.value && !computedLabelFor.value),
    'pt-0': !isHorizontal.value && !isFloating.value && !computedLabelFor.value,
    'd-block': !isHorizontal.value && !isFloating.value && !!computedLabelFor.value,
    [`col-form-label-${props.labelSize}`]: !!props.labelSize,
    'visually-hidden': props.labelVisuallyHidden,
  },
  isHorizontal.value ? null : labelAlignClasses.value,
])

const invalidFeedbackId = useId(undefined, '_BV_feedback_invalid_')

const validFeedbackId = useId(undefined, '_BV_feedback_valid_')
const descriptionId = useId(undefined, '_BV_description_')

const isFieldset = computed(() => !isFloating.value && !computedLabelFor.value)

const hasDescription = computed(() => !!slots.description || !!props.description)
const hasInvalidFeedback = computed(() => !!slots['invalid-feedback'] || !!props.invalidFeedback)
const hasValidFeedback = computed(() => !!slots['valid-feedback'] || !!props.validFeedback)

const computedAriaDescribedby = computed<string | null>(() => {
  const ids: string[] = []
  if (hasDescription.value) ids.push(descriptionId.value)
  if (computedState.value === false && hasInvalidFeedback.value) ids.push(invalidFeedbackId.value)
  if (computedState.value === true && hasValidFeedback.value) ids.push(validFeedbackId.value)
  return ids.length > 0 ? ids.join(' ') : null
})

const labelShowing = computed(() => !!slots.label || !!props.label || isHorizontal.value)

const labelComponentProps = computed(() => ({
  label: props.label,
  labelTag: labelTag.value,
  labelId: labelId.value,
  computedLabelFor: computedLabelFor.value,
  isFieldset: isFieldset.value,
  isHorizontal: isHorizontal.value,
  labelColProps: labelColProps.value,
  labelAlignClasses: labelAlignClasses.value,
  labelClasses: labelClasses.value,
  labelAttrs: props.labelAttrs,
}))

const contentComponentProps = computed(() => ({
  invalidFeedback: props.invalidFeedback,
  validFeedback: props.validFeedback,
  description: props.description,
  feedbackAriaLive: props.feedbackAriaLive,
  state: computedState.value,
  tooltip: props.tooltip,
  invalidFeedbackId: invalidFeedbackId.value,
  validFeedbackId: validFeedbackId.value,
  descriptionId: descriptionId.value,
}))
</script>
