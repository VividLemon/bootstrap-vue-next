<template>
  <BButton @click="pickColor">Pick a color</BButton>
  <p v-if="result" class="mt-2 mb-0">
    Resolved with <code>{{ result }}</code>
  </p>
</template>

<script setup lang="ts">
import { h, ref } from 'vue'
import { BButton } from 'bootstrap-vue-next/components/BButton'
import { useDialog } from 'bootstrap-vue-next/composables/useDialog'

const { create } = useDialog()
const result = ref('')

const colors = ['primary', 'success', 'danger'] as const

const pickColor = async () => {
  await using answer = await create({
    title: 'Pick a color',
    slots: {
      // `ok(value)` hides the dialog with trigger 'ok' and `value` as the result value
      default: ({ ok }) =>
        h(
          'div',
          { class: 'd-flex gap-2' },
          colors.map((theme) =>
            h(BButton, { color: { theme }, onClick: () => ok(theme) }, () => theme),
          ),
        ),
      // No OK / Cancel buttons for this one
      footer: undefined,
    },
  }).show()
  result.value = JSON.stringify({ trigger: answer.trigger, ok: answer.ok, value: answer.value })
}
</script>
