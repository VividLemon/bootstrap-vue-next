<template>
  <BButton @click="open = true">Open static dialog</BButton>

  <BDialog
    v-model="open"
    backdrop="static"
    :keyboard="false"
    title="Static backdrop"
    @hide-prevented="refused++"
  >
    Clicking the backdrop or pressing <kbd>Esc</kbd> does not close this dialog. It bounces instead.
    <p class="mb-0 mt-2">Refused close requests: {{ refused }}</p>

    <template #footer="{ close }">
      <BButton :color="{ theme: 'primary' }" @click="close()">Understood</BButton>
    </template>
  </BDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
const refused = ref(0)
</script>
