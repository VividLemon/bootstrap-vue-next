<template>
  <BButton @click="first = true">Open first dialog</BButton>

  <BDialog v-model="first" size="lg" title="First dialog">
    <p>Dialogs opened later sit on top of earlier ones.</p>
    <BButton @click="second = true">Open second dialog</BButton>
  </BDialog>

  <BDialog v-model="second" title="Second dialog">
    <p><kbd>Esc</kbd> closes the topmost dialog only.</p>
    <BButton size="sm" @click="third = true">Open third dialog</BButton>
  </BDialog>

  <BDialog v-model="third" size="sm" title="Third dialog">Close me first.</BDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const first = ref(false)
const second = ref(false)
const third = ref(false)
</script>
