<template>
  <tfoot :class="computedClasses">
    <slot />
  </tfoot>
</template>

<script setup lang="ts">
import {resolvePartColor, toColorClasses} from '../../composables/useThemeClasses'
import {useDefaults} from '../../composables/useDefaults'
import type {BTfootProps, BTfootSlots} from '../../types'
import {computed} from 'vue'

const _props = withDefaults(defineProps<BTfootProps>(), {
  color: undefined,
})
const props = useDefaults(_props, 'BTfoot')
const computedColor = computed(() => resolvePartColor(props.color, {}))
defineSlots<BTfootSlots>()

const computedClasses = computed(() => [
  toColorClasses('theme', computedColor.value.theme),
  toColorClasses('bg', computedColor.value.bg),
  toColorClasses('fg', computedColor.value.fg),
])
</script>
