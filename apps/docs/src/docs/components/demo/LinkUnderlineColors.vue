<template>
  <p v-for="color in colors" :key="color">
    <BLink :underline-theme="color"> {{ color }} link </BLink>
  </p>
</template>

<script setup lang="ts">
import type { ThemeColor } from 'bootstrap-vue-next'
const colors: ThemeColor[] = [
  'primary',
  'accent',
  'secondary',
  'success',
  'danger',
  'warning',
  'info',
  'inverse',
]
</script>
