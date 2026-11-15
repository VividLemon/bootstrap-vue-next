<template>
  <BButton @click="dialog = !dialog"> Toggle dialog via Model </BButton>
  <BDialog v-model="dialog" title="Hello, World!"> Foobar? </BDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const dialog = ref(false)
</script>
