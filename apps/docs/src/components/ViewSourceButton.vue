<template>
  <VBLink :href class="btn btn-outline-info"> <slot> View Source </slot> </VBLink>
</template>

<script setup lang="ts">
import VBLink from './VBLink.vue'

defineSlots<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: (props: Record<string, never>) => any
}>()

defineProps<{
  href: string
}>()
</script>
