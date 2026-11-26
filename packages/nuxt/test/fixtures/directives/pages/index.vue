<template>
  <div id="directives-page">
    <span
      id="tooltip-el"
      v-b-tooltip.hover
      title="A tooltip"
    >Tooltip target</span>
    <BButton
      id="modal-trigger"
      v-b-toggle.my-modal
    >
      Open dialog
    </BButton>
    <BDialog
      id="my-modal"
      title="Directive modal"
    >
      Directive modal body
    </BDialog>
    <span
      id="popover-el"
      v-b-popover.hover
      title="A popover"
    >Popover target</span>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DirectivesIndex' })
</script>
