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
  border: null,
  tag: 'div',
  text: undefined,
  // ColorExtendables props
  bg: null,
  fg: null,
  theme: null,
  // End ColorExtendables props
})
defineSlots<BCardHeadFootSlots>()

const computedClasses = useThemeClasses(props)
</script>
