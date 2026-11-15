<template>
  <div>
    <BButton @click="confirmBox">Show Confirm</BButton>
    <div>Result: {{ confirmResult ?? 'null' }}</div>
  </div>
</template>

<script setup lang="ts">
import { BDialogActions } from 'bootstrap-vue-next/components/BDialog'
import { useModal } from 'bootstrap-vue-next/composables/useModal'

import { h, ref } from 'vue'

const { create } = useModal()
const confirmResult = ref<boolean | null | undefined>(null)

const confirmBox = async () => {
  await using value = await create({
    body: 'Are you sure you want to do this?',
    title: 'Confirm',
    slots: { footer: () => h(BDialogActions, { okTitle: 'Yes', cancelTitle: 'No' }) },
  }).show()
  confirmResult.value =
    typeof value === 'object' && value !== null && 'ok' in value ? value.ok : null
}
</script>
