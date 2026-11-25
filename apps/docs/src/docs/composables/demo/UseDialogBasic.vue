<template>
  <BButton @click="showExample">Click me</BButton>
  <p v-if="result" class="mt-2 mb-0">
    Resolved with <code>{{ result }}</code>
  </p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BButton } from 'bootstrap-vue-next/components/BButton'
import { useDialog } from 'bootstrap-vue-next/composables/useDialog'

const { create } = useDialog()
const result = ref('')

const showExample = async () => {
  // Disposed when this block ends: the dialog is removed from the orchestrator
  await using value = await create({
    title: 'Hello World!',
    body: 'OK, Cancel or close me.',
  }).show()
  result.value = JSON.stringify({ trigger: value.trigger, ok: value.ok })
}
</script>
