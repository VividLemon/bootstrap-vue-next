<template>
  <BButton @click="open = true">Rename project</BButton>
  <p class="mt-2 mb-0">Last result: {{ result }}</p>

  <BDialog v-model="open" title="Rename project" focus="ok" @ok="onOk" @hidden="onHidden">
    <BFormInput v-model="name" placeholder="Project name" />
    <p v-if="invalid" class="fg-danger mt-2 mb-0">Enter a name first.</p>

    <template #footer>
      <BDialogActions ok-title="Rename" :cancel-attrs="{ variant: 'outline' }" />
    </template>
  </BDialog>
</template>

<script setup lang="ts">
import type { BvTriggerableEvent } from 'bootstrap-vue-next'
import { ref } from 'vue'

const open = ref(false)
const name = ref('')
const invalid = ref(false)
const result = ref('none yet')

// `ok` fires before the dialog hides and can be prevented
const onOk = (event: BvTriggerableEvent) => {
  invalid.value = name.value.trim() === ''
  if (invalid.value) event.preventDefault()
}

// Every way of closing ends in `hidden`; `trigger` says which one it was
const onHidden = (event: BvTriggerableEvent) => {
  result.value =
    event.trigger === 'ok' ? `renamed to "${name.value}"` : `closed by ${event.trigger}`
}
</script>
