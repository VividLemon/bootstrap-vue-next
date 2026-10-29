<template>
  <p v-for="opacity in opacities" :key="opacity">
    <BLink :underline-opacity="opacity"> {{ opacity }} link </BLink>
  </p>
</template>

<script setup lang="ts">
import type { UnderlineOpacity } from 'bootstrap-vue-next'
const opacities: UnderlineOpacity[] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
</script>
