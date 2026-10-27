<template>
  <tr :class="computedClasses">
    <slot />
  </tr>
</template>

<script setup lang="ts">
import {toColorClasses} from '../../composables/useThemeClasses'
import {useDefaults} from '../../composables/useDefaults'
import type {BTrProps, BTrSlots} from '../../types'
import {computed} from 'vue'

const _props = withDefaults(defineProps<BTrProps>(), {
  theme: null,
  bg: null,
  fg: null,
})
const props = useDefaults(_props, 'BTr')
defineSlots<BTrSlots>()

const computedClasses = computed(() => [
  toColorClasses('theme', props.theme),
  toColorClasses('bg', props.bg),
  toColorClasses('fg', props.fg),
])
</script>
