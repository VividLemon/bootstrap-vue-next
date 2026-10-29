<template>
  <p v-for="opacity in opacities" :key="opacity">
    <BLink :opacity-hover="opacity"> {{ opacity }} link </BLink>
  </p>
</template>

<script setup lang="ts">
import type { LinkOpacity } from 'bootstrap-vue-next'
const opacities: LinkOpacity[] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
</script>
