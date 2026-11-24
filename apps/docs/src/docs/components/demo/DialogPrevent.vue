<template>
  <BButton @click="preventableDialog = !preventableDialog"> Toggle dialog </BButton>

  <BDialog v-model="preventableDialog" title="Hello, World!" @hide="preventFn">
    Foobar?
    <BFormCheckbox v-model="preventDialog">Prevent close</BFormCheckbox>
  </BDialog>
</template>

<script setup lang="ts">
import type { BvTriggerableEvent } from 'bootstrap-vue-next'
import { ref } from 'vue'

const preventableDialog = ref(false)
const preventDialog = ref(true)
const preventFn = (e: BvTriggerableEvent) => {
  if (preventDialog.value) e.preventDefault()
}
</script>
