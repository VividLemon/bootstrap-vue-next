<template>
  <BFormGroup
    label="Tags"
    description="Lowercase letters only, up to 4 tags"
    :state="state"
    :invalid-feedback="message"
  >
    <BFormChips v-model="tags" :max-chips="4" :state="state" @add="onAdd" />
  </BFormGroup>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BvEvent } from 'bootstrap-vue-next'

const tags = ref(['vue'])
const message = ref('')
const state = computed(() => (message.value ? false : null))

const onAdd = (value: string, event: BvEvent) => {
  if (!/^[a-z]+$/.test(value)) {
    event.preventDefault()
    message.value = `"${value}" is not lowercase letters only`
    return
  }
  message.value = ''
}
</script>
