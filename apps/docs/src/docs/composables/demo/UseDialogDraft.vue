<template>
  <div class="d-flex gap-2">
    <BButton @click="openDraft">{{ draft ? 'Continue message' : 'New message' }}</BButton>
    <BButton v-if="draft" :color="{ theme: 'secondary' }" @click="discardDraft">
      Discard draft
    </BButton>
  </div>
  <p v-if="sent" class="mt-2 mb-0">
    Sent <code>{{ sent }}</code>
  </p>
</template>

<script setup lang="ts">
import { defineComponent, h, onUnmounted, type PropType, ref, shallowRef } from 'vue'
import { BButton } from 'bootstrap-vue-next/components/BButton'
import { BFormInput } from 'bootstrap-vue-next/components/BFormInput'
import { useDialog } from 'bootstrap-vue-next/composables/useDialog'

// The form keeps its own state. The dialog's content stays mounted while the dialog is hidden, so
// what the user typed is still there on the next show()
const MessageForm = defineComponent({
  // The slot scope (`ok`, `hide`, `visible`, ...) is bound as props; keep the rest off the root
  inheritAttrs: false,
  props: {
    ok: { type: Function as PropType<(value?: unknown) => void>, required: true },
    hide: { type: Function as PropType<(trigger?: string) => void>, required: true },
  },
  setup(props) {
    const to = ref('')
    const message = ref('')
    return () =>
      h('div', { class: 'd-flex flex-column gap-2' }, [
        h(BFormInput, {
          modelValue: to.value,
          'onUpdate:modelValue': (v: unknown) => (to.value = String(v ?? '')),
          placeholder: 'To',
        }),
        h(BFormInput, {
          modelValue: message.value,
          'onUpdate:modelValue': (v: unknown) => (message.value = String(v ?? '')),
          placeholder: 'Message',
        }),
        h('div', { class: 'd-flex justify-content-end gap-2' }, [
          h(
            BButton,
            { color: { theme: 'secondary' }, onClick: () => props.hide('later') },
            () => 'Later',
          ),
          h(
            BButton,
            { onClick: () => props.ok({ to: to.value, message: message.value }) },
            () => 'Send',
          ),
        ]),
      ])
  },
})

const { create } = useDialog()
const draft = shallowRef<ReturnType<typeof create>>()
const sent = ref('')

const discardDraft = async () => {
  const current = draft.value
  draft.value = undefined
  await current?.destroy()
}

const openDraft = async () => {
  // Created once and kept, instead of `await using`, so the form survives between shows
  draft.value ??= create(
    { title: 'New message' },
    { slots: { default: MessageForm, footer: undefined } },
  )
  const result = await draft.value.show()
  if (result.ok) {
    sent.value = JSON.stringify(result.value)
    await discardDraft()
  }
}

// Created from a click handler, so nothing destroys it for us
onUnmounted(discardDraft)
</script>
