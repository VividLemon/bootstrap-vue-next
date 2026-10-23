<template>
  <BAlert v-model="showDefault" dismissible variant="success"> Default: fades out in 0.15s </BAlert>

  <BAlert v-model="showSlow" class="alert-slow" dismissible variant="info">
    Slow: tuned with --bs-alert-transition-duration
  </BAlert>

  <BAlert v-model="showInstant" dismissible no-animation variant="warning">
    Instant: no-animation adds .alert-instant
  </BAlert>

  <BButton variant="secondary" @click="showAll"> Show all alerts </BButton>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BAlert } from 'bootstrap-vue-next/components/BAlert'
import { BButton } from 'bootstrap-vue-next/components/BButton'

const showDefault = ref(true)
const showSlow = ref(true)
const showInstant = ref(true)

const showAll = () => {
  showDefault.value = true
  showSlow.value = true
  showInstant.value = true
}
</script>

<style scoped>
.alert-slow {
  --bs-alert-transition-duration: 1s;
  --bs-alert-transition-timing: ease-in-out;
}
</style>
