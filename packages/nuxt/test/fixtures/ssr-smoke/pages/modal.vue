<template>
  <div id="modal-page">
    <BDialog
      id="test-modal"
      title="Test Modal"
    >
      Modal content
    </BDialog>
    <BButton> Open modal </BButton>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ModalPage' })
</script>
