<template>
  <component :is="props.tag" class="card-subtitle" :class="computedClasses">
    <slot>
      {{ props.text }}
    </slot>
  </component>
</template>

<script setup lang="ts">
import type {BCardSubtitleProps, BCardSubtitleSlots} from '../../types'
import {useThemeClasses} from '../../composables/useThemeClasses'
import {useDefaults} from '../../composables/useDefaults'

const _props = withDefaults(defineProps<BCardSubtitleProps>(), {
  tag: 'h6',
  text: undefined,
  fg: '2',
})
const props = useDefaults(_props, 'BCardSubtitle')
defineSlots<BCardSubtitleSlots>()

const computedClasses = useThemeClasses(() => ({fg: props.fg}))
</script>
