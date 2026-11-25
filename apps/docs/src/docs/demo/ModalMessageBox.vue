<template>
  <div>
    <BButton @click="okBox">Show Message</BButton>
    <div>Result: {{ okResult }}</div>
  </div>
</template>

<script setup lang="ts">
import { BDialogActions } from 'bootstrap-vue-next/components/BDialog'
import { useDialog } from 'bootstrap-vue-next/composables/useDialog'
import { h, ref } from 'vue'

const { create } = useDialog()

const okResult = ref<boolean | null | undefined>(null)

const okBox = async () => {
  await using value = await create({
    body: 'This is an informational message',
    title: 'Message',
    slots: { footer: () => h(BDialogActions, { okOnly: true }) },
  }).show()
  okResult.value = value.ok
}
</script>
