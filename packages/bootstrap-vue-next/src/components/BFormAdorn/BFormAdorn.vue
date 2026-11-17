<template>
  <component :is="props.tag" :class="computedClasses">
    <template v-if="hasStart">
      <div v-if="slots.start" class="form-adorn-icon" aria-hidden="true">
        <slot name="start" />
      </div>
      <span v-else class="form-adorn-text" aria-hidden="true">{{ props.startText }}</span>
    </template>
    <!-- With only an end adornment, v6 keeps the adornment first in the DOM and moves it with
    .form-adorn-end, so the end adornment renders here in that case -->
    <template v-if="endOnly">
      <div v-if="slots.end" class="form-adorn-icon" aria-hidden="true">
        <slot name="end" />
      </div>
      <span v-else class="form-adorn-text" aria-hidden="true">{{ props.endText }}</span>
    </template>
    <slot />
    <template v-if="hasEnd && !endOnly">
      <div v-if="slots.end" class="form-adorn-icon" aria-hidden="true">
        <slot name="end" />
      </div>
      <span v-else class="form-adorn-text" aria-hidden="true">{{ props.endText }}</span>
    </template>
  </component>
</template>

<script setup lang="ts">
import {computed, provide} from 'vue'
import type {BFormAdornProps, BFormAdornSlots} from '../../types'
import {useDefaults} from '../../composables/useDefaults'
import {formAdornKey} from '../../utils/keys'

const _props = withDefaults(defineProps<BFormAdornProps>(), {
  endText: undefined,
  size: undefined,
  startText: undefined,
  tag: 'label',
})
const props = useDefaults(_props, 'BFormAdorn')
const slots = defineSlots<BFormAdornSlots>()

// Inner controls (BFormInput, …) render `.form-ghost` instead of `.form-control`
provide(formAdornKey, true)

const hasStart = computed(() => !!slots.start || !!props.startText)
const hasEnd = computed(() => !!slots.end || !!props.endText)
const endOnly = computed(() => hasEnd.value && !hasStart.value)

const computedClasses = computed(() => [
  'form-control',
  'form-adorn',
  {
    [`form-control-${props.size}`]: props.size !== undefined,
    'form-adorn-end': endOnly.value,
  },
])
</script>
