<template>
  <BFormInvalidFeedback
    v-if="hasInvalidFeedbackSlot || invalidFeedback"
    :id="invalidFeedbackId"
    :aria-live="feedbackAriaLive"
    :state="state"
    :tooltip="tooltip"
  >
    <slot name="invalid-feedback">{{ invalidFeedback }}</slot>
  </BFormInvalidFeedback>
  <BFormValidFeedback
    v-if="hasValidFeedbackSlot || validFeedback"
    :id="validFeedbackId"
    :aria-live="feedbackAriaLive"
    :state="state"
    :tooltip="tooltip"
  >
    <slot name="valid-feedback">{{ validFeedback }}</slot>
  </BFormValidFeedback>
  <BFormText v-if="hasDescriptionSlot || description" :id="descriptionId">
    <slot name="description">{{ description }}</slot>
  </BFormText>
</template>

<script setup lang="ts">
import {computed, useSlots} from 'vue'
import type {ValidationState} from '../../types'
import BFormInvalidFeedback from '../BForm/BFormInvalidFeedback.vue'
import BFormValidFeedback from '../BForm/BFormValidFeedback.vue'
import BFormText from '../BForm/BFormText.vue'

defineProps<{
  invalidFeedback?: string
  validFeedback?: string
  description?: string
  feedbackAriaLive?: string
  state?: ValidationState
  tooltip?: boolean
  invalidFeedbackId?: string
  validFeedbackId?: string
  descriptionId?: string
}>()

defineSlots<{
  'invalid-feedback'?: () => unknown
  'valid-feedback'?: () => unknown
  description?: () => unknown
}>()

const slots = useSlots()
const hasInvalidFeedbackSlot = computed(() => !!slots['invalid-feedback'])
const hasValidFeedbackSlot = computed(() => !!slots['valid-feedback'])
const hasDescriptionSlot = computed(() => !!slots['description'])
</script>
