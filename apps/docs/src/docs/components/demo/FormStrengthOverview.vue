<template>
  <label for="strength-overview" class="form-label">Password</label>
  <BFormInput
    id="strength-overview"
    v-model="password"
    type="password"
    autocomplete="new-password"
    aria-describedby="strength-overview-help"
  />
  <BFormStrength :value="password" />
  <div id="strength-overview-help" class="form-text">
    Use 8 or more characters with a mix of letters, numbers and symbols.
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const password = ref('Bootstrap')
</script>
