<template>
  <div>
    <BButton @click="testToggle">Click me</BButton>
    <BDialog id="toggleTest"> content </BDialog>
    <span v-if="reason !== ''" class="mx-3">Close reason: {{ reason }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useComponentToggle } from 'bootstrap-vue-next'

const toggle = useComponentToggle('toggleTest')
const reason = ref('')

async function testToggle() {
  const e = await toggle.show(true)
  if (e === 'ok') {
    console.log('ok pressed')
  } else {
    console.log('closed with', e)
  }
  reason.value = String(e)
}
</script>
