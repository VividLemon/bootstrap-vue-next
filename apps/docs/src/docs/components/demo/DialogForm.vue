<template>
  <BButton @click="open = true">Open form dialog</BButton>
  <p class="mt-2 mb-0">Trigger: {{ trigger }}, value: {{ value }}</p>

  <BDialog ref="form-dialog" v-model="open" title="Delete this file?" @hidden="onHidden">
    <form id="delete-form" method="dialog">This cannot be undone.</form>

    <template #footer>
      <BButton form="delete-form" type="submit" value="keep" variant="outline">Keep</BButton>
      <BButton form="delete-form" type="submit" value="delete" :color="{ theme: 'danger' }">
        Delete
      </BButton>
    </template>
  </BDialog>
</template>

<script setup lang="ts">
import type { BvTriggerableEvent } from 'bootstrap-vue-next'
import { BDialog } from 'bootstrap-vue-next/components/BDialog'
import { type ComponentExposed } from 'vue-component-type-helpers'
import { ref, useTemplateRef } from 'vue'

const open = ref(false)
const trigger = ref<string | null>(null)
const value = ref<unknown>()
const dialog = useTemplateRef<ComponentExposed<typeof BDialog>>('form-dialog')

const onHidden = (event: BvTriggerableEvent) => {
  trigger.value = event.trigger
  value.value = dialog.value?.returnValue
}
</script>
