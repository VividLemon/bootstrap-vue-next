<template>
  <div>
    <div class="text-center mb-3 d-flex justify-content-between">
      <BSpinner v-for="theme in themes" :key="theme" :theme="theme" />
    </div>

    <div class="text-center d-flex justify-content-between">
      <BSpinner v-for="theme in themes" :key="theme" :theme="theme" type="grow" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ThemeColor } from 'bootstrap-vue-next'

const themes = [
  'primary',
  'secondary',
  'danger',
  'warning',
  'success',
  'info',
  'inverse',
] as ThemeColor[]
</script>
