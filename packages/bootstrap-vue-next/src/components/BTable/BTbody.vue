<template>
  <tbody :class="computedClasses">
    <slot />
  </tbody>
</template>

<script setup lang="ts">
import {toColorClasses} from '../../composables/useThemeClasses'
import type {BTbodyProps, BTbodySlots} from '../../types'
import {useDefaults} from '../../composables/useDefaults'
import {computed} from 'vue'

const _props = withDefaults(defineProps<BTbodyProps>(), {
  theme: null,
  bg: null,
  fg: null,
})
const props = useDefaults(_props, 'BTbody')
defineSlots<BTbodySlots>()

const computedClasses = computed(() => [
  toColorClasses('theme', props.theme),
  toColorClasses('bg', props.bg),
  toColorClasses('fg', props.fg),
])
</script>
