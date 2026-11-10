<template>
  <tr :class="computedClasses">
    <slot />
  </tr>
</template>

<script setup lang="ts">
import {resolvePartColor, toColorClasses} from '../../composables/useThemeClasses'
import {useDefaults} from '../../composables/useDefaults'
import type {BTrProps, BTrSlots} from '../../types'
import {computed} from 'vue'

const _props = withDefaults(defineProps<BTrProps>(), {
  color: undefined,
})
const props = useDefaults(_props, 'BTr')
const computedColor = computed(() => resolvePartColor(props.color, {}))
defineSlots<BTrSlots>()

const computedClasses = computed(() => [
  toColorClasses('theme', computedColor.value.theme),
  toColorClasses('bg', computedColor.value.bg),
  toColorClasses('fg', computedColor.value.fg),
])
</script>
