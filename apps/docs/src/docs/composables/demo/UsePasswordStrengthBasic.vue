<template>
  <BFormInput
    v-model="password"
    type="password"
    aria-label="Password"
    autocomplete="new-password"
    :state="password ? isStrongEnough : null"
  />
  <p class="mt-2 mb-0">Score: {{ score }}, strength: {{ strength ?? 'none' }}</p>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePasswordStrength } from 'bootstrap-vue-next/composables/usePasswordStrength'

const password = ref('')
const { score, strength } = usePasswordStrength(password, { minLength: 10 })
const isStrongEnough = computed(() => strength.value === 'good' || strength.value === 'strong')
</script>
