<template>
  <BButton @click="showToast">Show Toast</BButton>
  <BButton @click="showDialog">Show Dialog</BButton>
</template>

<script setup lang="ts">
import { BButton } from 'bootstrap-vue-next/components/BButton'
import { useDialog } from 'bootstrap-vue-next/composables/useDialog'
import { useToast } from 'bootstrap-vue-next/composables/useToast'

const { create: createToast } = useToast()
const { create: createDialog } = useDialog()

const showToast = async () => {
  await using _ = await createToast({
    title: 'Hello',
    body: 'This is a toast message!',
  }).show()
}

const showDialog = async () => {
  await using _ = await createDialog({
    title: 'Confirm Action',
    body: 'Are you sure you want to continue?',
  }).show()
}
</script>
