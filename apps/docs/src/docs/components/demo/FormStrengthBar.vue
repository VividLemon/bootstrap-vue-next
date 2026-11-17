<template>
  <!-- #region template -->
  <BFormInput
    v-model="password"
    type="password"
    aria-label="Password"
    autocomplete="new-password"
  />
  <BFormStrength :value="password" bar />
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import { ref } from 'vue'

const password = ref('Bootstrap6!')
</script>
