<template>
  <div>
    <BButton @click="confirmBox">Show Confirm</BButton>
    <div>Result: {{ confirmResult ?? 'null' }}</div>
  </div>
</template>

<script setup lang="ts">
import { BDialogActions } from 'bootstrap-vue-next/components/BDialog'
import { useDialog } from 'bootstrap-vue-next/composables/useDialog'

import { h, ref } from 'vue'

const { create } = useDialog()
const confirmResult = ref<boolean | null | undefined>(null)

const confirmBox = async () => {
  await using value = await create({
    body: 'Are you sure you want to do this?',
    title: 'Confirm',
    slots: { footer: () => h(BDialogActions, { okTitle: 'Yes', cancelTitle: 'No' }) },
  }).show()
  confirmResult.value = value.ok
}
</script>
