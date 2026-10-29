<template>
  <tfoot :class="computedClasses">
    <slot />
  </tfoot>
</template>

<script setup lang="ts">
import {toColorClasses} from '../../composables/useThemeClasses'
import {useDefaults} from '../../composables/useDefaults'
import type {BTfootProps, BTfootSlots} from '../../types'
import {computed} from 'vue'

const _props = withDefaults(defineProps<BTfootProps>(), {
  theme: null,
  bg: null,
  fg: null,
})
const props = useDefaults(_props, 'BTfoot')
defineSlots<BTfootSlots>()

const computedClasses = computed(() => [
  toColorClasses('theme', props.theme),
  toColorClasses('bg', props.bg),
  toColorClasses('fg', props.fg),
])
</script>
