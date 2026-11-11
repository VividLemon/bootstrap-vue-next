<template>
  <BContainer v-for="(label, breakpoint) in breakpoints" :key="breakpoint" :fluid="breakpoint">
    100% wide until {{ label }} breakpoint
  </BContainer>
</template>

<script setup lang="ts">
import type { Breakpoint } from 'bootstrap-vue-next'

const breakpoints = {
  'sm': 'small',
  'md': 'medium',
  'lg': 'large',
  'xl': 'extra large',
  '2xl': '2x extra large',
} as const satisfies Record<Breakpoint, string>
</script>
