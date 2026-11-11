<template>
  <component :is="tag" :class="computedClasses">
    <slot>
      {{ text }}
    </slot>
  </component>
</template>

<script setup lang="ts">
import {useThemeClasses} from '../composables/useThemeClasses'
import type {BCardHeadFootProps, BCardHeadFootSlots} from '../types'

const props = withDefaults(defineProps<BCardHeadFootProps>(), {
  color: undefined,
  tag: 'div',
  text: undefined,
})
defineSlots<BCardHeadFootSlots>()

const {classes: computedClasses} = useThemeClasses(() => props.color ?? {})
</script>
