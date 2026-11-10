<template>
  <tbody :class="computedClasses">
    <slot />
  </tbody>
</template>

<script setup lang="ts">
import {resolvePartColor, toColorClasses} from '../../composables/useThemeClasses'
import type {BTbodyProps, BTbodySlots} from '../../types'
import {useDefaults} from '../../composables/useDefaults'
import {computed} from 'vue'

const _props = withDefaults(defineProps<BTbodyProps>(), {
  color: undefined,
})
const props = useDefaults(_props, 'BTbody')
const computedColor = computed(() => resolvePartColor(props.color, {}))
defineSlots<BTbodySlots>()

const computedClasses = computed(() => [
  toColorClasses('theme', computedColor.value.theme),
  toColorClasses('bg', computedColor.value.bg),
  toColorClasses('fg', computedColor.value.fg),
])
</script>
