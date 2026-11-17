<template>
  <BFormInput
    v-model="password"
    type="password"
    aria-label="Password"
    autocomplete="new-password"
  />
  <BFormStrength
    :value="password"
    show-text
    :messages="{ weak: 'Too weak', strong: 'Excellent' }"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const password = ref('abc')
</script>
