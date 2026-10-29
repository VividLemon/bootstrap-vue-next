<!-- App.vue -->
<template>
  <BApp :defaults="{ BButton: { theme: 'primary' } }">
    <RouterView />
  </BApp>
</template>

<script setup lang="ts">
import { BApp } from 'bootstrap-vue-next'
</script>
