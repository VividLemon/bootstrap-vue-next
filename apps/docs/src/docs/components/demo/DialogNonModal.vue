<template>
  <BButton @click="open = !open">Toggle non-modal dialog</BButton>

  <BDialog v-model="open" :modal="false" title="Non-modal dialog">
    The page behind this dialog stays usable: you can scroll, select text and click the button
    again.
  </BDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
</script>
