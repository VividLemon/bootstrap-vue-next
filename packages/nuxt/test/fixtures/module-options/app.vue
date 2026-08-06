<template>
  <div>
    <BButton id="btn">
      Click me
    </BButton>
    <BButton
      id="toast-trigger"
      @click="showToast"
    >
      Show toast
    </BButton>
    <BButton
      id="configured-modal-trigger"
      v-b-modal.configured-modal
    >
      Open configured modal
    </BButton>
    <BModal
      id="configured-modal"
      title="Configured modal"
    >
      Configured modal body
    </BModal>
    <BLink
      id="configured-link"
      to="/module-options-target"
    >
      Configured link
    </BLink>
    <div id="toast-status">
      {{ toastStatus }}
    </div>
    <div id="custom-teleport" />
    <div
      id="tooltip-target"
      v-b-tooltip.hover
      title="A tooltip"
    >
      Hover me
    </div>
  </div>
</template>

<script setup lang="ts">
const toast = useToast()

const toastStatus = computed(() =>
  toast._isOrchestratorInstalled.value && typeof toast.create === 'function' ? 'toast-ready' : 'toast-missing'
)

const showToast = () => {
  toast.create({
    body: 'Configured toast body',
    title: 'Configured toast title',
    modelValue: true,
  })
}
</script>
