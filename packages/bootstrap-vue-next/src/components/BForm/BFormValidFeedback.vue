<template>
  <component
    :is="props.tag"
    :id="props.id"
    :role="props.role"
    :aria-live="props.ariaLive"
    :aria-atomic="props.ariaLive ? true : undefined"
    :class="computedClasses"
  >
    <slot>
      {{ props.text }}
    </slot>
  </component>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import type {BFormFeedbackSharedProps} from '../../types/ComponentProps'
import {useDefaults} from '../../composables/useDefaults'
import type {BFormValidFeedbackSlots} from '../../types'

const _props = withDefaults(defineProps<BFormFeedbackSharedProps>(), {
  ariaLive: undefined,
  forceShow: false,
  id: undefined,
  role: undefined,
  state: null,
  tag: 'div',
  text: undefined,
  tooltip: false,
})
const props = useDefaults(_props, 'BFormInvalidFeedback')
defineSlots<BFormValidFeedbackSlots>()

const computedShow = computed(() => props.forceShow === true || props.state === true)

const computedClasses = computed(() => ({
  'd-block': computedShow.value,
  'valid-feedback': !props.tooltip,
  'valid-tooltip': props.tooltip,
}))
</script>
