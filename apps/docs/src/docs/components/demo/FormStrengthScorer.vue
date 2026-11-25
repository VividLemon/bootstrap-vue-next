<template>
  <BFormInput
    v-model="password"
    type="password"
    aria-label="Password"
    autocomplete="new-password"
  />
  <BFormStrength :value="password" :scorer="scoreByLength" :thresholds="{ weak: 6, fair: 10, good: 14 }" show-text />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const password = ref('correct horse')
// One point per character
const scoreByLength = (value: string) => value.length
</script>
