<template>
  <thead :class="computedClasses">
    <slot />
  </thead>
</template>

<script setup lang="ts">
import {resolvePartColor, toColorClasses} from '../../composables/useThemeClasses'
import type {BTheadProps, BTheadSlots} from '../../types'
import {useDefaults} from '../../composables/useDefaults'
import {computed} from 'vue'

const _props = withDefaults(defineProps<BTheadProps>(), {
  color: undefined,
})
const props = useDefaults(_props, 'BThead')
const computedColor = computed(() => resolvePartColor(props.color, {}))
defineSlots<BTheadSlots>()

const computedClasses = computed(() => [
  toColorClasses('theme', computedColor.value.theme),
  toColorClasses('bg', computedColor.value.bg),
  toColorClasses('fg', computedColor.value.fg),
])
</script>
