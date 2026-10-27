<template>
  <thead :class="computedClasses">
    <slot />
  </thead>
</template>

<script setup lang="ts">
import {toColorClasses} from '../../composables/useThemeClasses'
import type {BTheadProps, BTheadSlots} from '../../types'
import {useDefaults} from '../../composables/useDefaults'
import {computed} from 'vue'

const _props = withDefaults(defineProps<BTheadProps>(), {
  theme: null,
  bg: null,
  fg: null,
})
const props = useDefaults(_props, 'BThead')
defineSlots<BTheadSlots>()

const computedClasses = computed(() => [
  toColorClasses('theme', props.theme),
  toColorClasses('bg', props.bg),
  toColorClasses('fg', props.fg),
])
</script>
