<template>
  <component :is="props.tag" class="menu-header">
    <slot>{{ props.text }}</slot>
  </component>
</template>

<script setup lang="ts">
import {useDefaults} from '../../composables/useDefaults'
import type {BMenuHeaderProps, BMenuHeaderSlots} from '../../types'

const _props = withDefaults(defineProps<BMenuHeaderProps>(), {
  tag: 'h6',
  text: undefined,
})
const props = useDefaults(_props, 'BMenuHeader')
defineSlots<BMenuHeaderSlots>()
</script>
