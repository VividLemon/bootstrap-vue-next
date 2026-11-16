<template>
  <slot
    :href="typeof props.to === 'string' ? props.to : '#'"
    :navigate="navigate"
    :is-active="true"
    :is-exact-active="false"
    :prefetch="prefetch"
    :prefetched="false"
    :should-prefetch="shouldPrefetch"
  />
</template>

<script setup lang="ts">
// A stand-in for NuxtLink in `custom` mode, see plugins/nuxt-link.ts
const props = defineProps<{
  to: string | { path?: string }
  custom?: boolean
}>()

const navigate = () => Promise.resolve()
const prefetch = () => Promise.resolve()
const shouldPrefetch = () => false
</script>
