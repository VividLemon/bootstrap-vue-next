<template>
  <component :is="props.tag" class="menu-text">
    <slot>{{ props.text }}</slot>
  </component>
</template>

<script setup lang="ts">
import {useDefaults} from '../../composables/useDefaults'
import type {BMenuTextProps, BMenuTextSlots} from '../../types'

const _props = withDefaults(defineProps<BMenuTextProps>(), {
  tag: 'span',
  text: undefined,
})
const props = useDefaults(_props, 'BMenuText')
defineSlots<BMenuTextSlots>()
</script>
