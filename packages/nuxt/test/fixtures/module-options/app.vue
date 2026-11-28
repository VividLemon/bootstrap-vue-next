<template>
  <BApp>
    <div>
      <BButton id="btn"> Click me </BButton>
      <BButton id="toast-trigger" @click="showToast"> Show toast </BButton>
      <BButton id="configured-dialog-trigger" @click="isConfiguredDialogVisible = true">
        Open configured dialog
      </BButton>
      <BDialog id="configured-dialog" v-model="isConfiguredDialogVisible" title="Configured dialog">
        Configured dialog body
      </BDialog>
      <BLink id="configured-link" to="/module-options-target"> Configured link </BLink>
      <div id="toast-status">
        {{ toastStatus }}
      </div>
    </div>
  </BApp>
</template>

<script setup lang="ts">
const toast = useToast()
const isConfiguredDialogVisible = ref(false)

const toastStatus = computed(() =>
  toast._isOrchestratorInstalled.value && typeof toast.create === 'function'
    ? 'toast-ready'
    : 'toast-missing'
)

const showToast = () => {
  toast.create({
    body: 'Configured toast body',
    title: 'Configured toast title',
    modelValue: true,
  })
}
</script>
