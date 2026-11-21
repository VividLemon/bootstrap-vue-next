<template>
  <div class="d-flex flex-wrap gap-2">
    <BButton id="activator-by-id" :color="{ theme: 'primary' }">By ID string</BButton>
    <BPopover activator="activator-by-id" title="ID string">
      This popover's activator is given by its element ID
    </BPopover>

    <BButton ref="buttonRef" :color="{ theme: 'success' }">By template ref</BButton>
    <BPopover :activator="buttonRef" title="Template ref">
      This popover's activator is given by a template ref
    </BPopover>

    <div id="activator-toolbar" class="d-flex gap-2">
      <BButton :color="{ theme: 'info' }">By querySelector</BButton>
      <BButton :color="{ theme: 'secondary' }">Not an activator</BButton>
    </div>
    <BPopover activator="#activator-toolbar > button:first-child" title="querySelector">
      This popover's activator is given by a querySelector string
    </BPopover>
  </div>
</template>

<script setup lang="ts">
import { type ComponentPublicInstance, ref } from 'vue'

const buttonRef = ref<ComponentPublicInstance>()
</script>
