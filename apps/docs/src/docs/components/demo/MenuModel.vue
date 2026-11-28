<template>
  <p>Open: {{ model }}</p>

  <div class="d-flex flex-wrap gap-2 mb-2">
    <BButton @click="model = true">Open menu</BButton>
    <BButton @click="model = false">Close menu</BButton>
    <BFormCheckbox v-model="disabled" switch>Disabled</BFormCheckbox>
  </div>

  <BMenu v-model="model" text="Menu" :disabled="disabled">
    <BMenuItem>Action</BMenuItem>
    <BMenuItem>Another action</BMenuItem>
  </BMenu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const model = ref(false)
const disabled = ref(false)
</script>
