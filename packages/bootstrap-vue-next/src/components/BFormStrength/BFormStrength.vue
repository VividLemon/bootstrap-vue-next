<template>
  <div
    v-bind="$attrs"
    :class="props.bar ? 'strength-bar' : 'strength'"
    :data-bs-strength="strength ?? undefined"
    aria-hidden="true"
  >
    <template v-if="!props.bar">
      <div
        v-for="(level, index) in levels"
        :key="level"
        v-bind="props.segmentAttrs"
        class="strength-segment"
        :class="{active: index <= strengthIndex}"
      />
    </template>
  </div>
  <span
    v-if="props.showText"
    v-bind="props.textAttrs"
    class="strength-text"
    :data-bs-strength="strength ?? undefined"
    :style="textStyle"
    aria-live="polite"
    >{{ message }}</span
  >
</template>

<script setup lang="ts">
import {computed, watch} from 'vue'
import type {BFormStrengthEmits, BFormStrengthProps} from '../../types'
import type {PasswordStrength} from '../../types/PasswordStrength'
import {useDefaults} from '../../composables/useDefaults'
import {usePasswordStrength} from '../../composables/usePasswordStrength'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<BFormStrengthProps>(), {
  bar: false,
  messages: undefined,
  minLength: 8,
  scorer: undefined,
  segmentAttrs: undefined,
  showText: false,
  textAttrs: undefined,
  thresholds: undefined,
  value: '',
  weights: undefined,
})
const props = useDefaults(_props, 'BFormStrength')

const emit = defineEmits<BFormStrengthEmits>()

const levels: readonly PasswordStrength[] = ['weak', 'fair', 'good', 'strong']

const defaultMessages: Readonly<Record<PasswordStrength, string>> = {
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
}

// Each level's text color. Bootstrap's strength.ts writes `--strength-color: var(--danger-text)`,
// which matches neither the shipped (prefixed) token nor a v6 color, so the text stays uncolored
const textColors: Readonly<Record<PasswordStrength, string>> = {
  weak: 'danger',
  fair: 'warning',
  good: 'info',
  strong: 'success',
}

const {score, strength} = usePasswordStrength(
  () => props.value ?? '',
  () => ({
    minLength: props.minLength,
    weights: props.weights,
    thresholds: props.thresholds,
    scorer: props.scorer,
  })
)

const strengthIndex = computed(() => (strength.value ? levels.indexOf(strength.value) : -1))

const message = computed(() =>
  strength.value ? (props.messages?.[strength.value] ?? defaultMessages[strength.value]) : ''
)

const textStyle = computed(() =>
  strength.value ? {'--bs-strength-color': `var(--bs-${textColors[strength.value]}-fg)`} : undefined
)

watch(strength, (value) => {
  emit('change', {strength: value, score: score.value})
})
</script>
