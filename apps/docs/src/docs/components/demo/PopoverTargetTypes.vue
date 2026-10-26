<template>
  <div class="d-flex flex-column gap-3">
    <BPopover title="String ID Target">
      <template #target>
        <BButton id="target-string" theme="primary">Target by ID String</BButton>
      </template>
      This popover targets an element by its ID string
    </BPopover>

    <BPopover :target="buttonRef" title="Template Ref Target">
      <template #target>
        <BButton ref="buttonRef" theme="success">Target by Ref</BButton>
      </template>
      This popover targets an element via a template ref
    </BPopover>

    <BPopover target="#toolbar > button:first-child" title="querySelector Target">
      <div id="toolbar" class="d-flex gap-2">
        <BButton theme="info">Target by querySelector</BButton>
        <BButton theme="secondary">Not targeted</BButton>
      </div>
      This popover targets an element using a querySelector string
    </BPopover>
  </div>
</template>

<script setup lang="ts">
import { type ComponentPublicInstance, ref } from 'vue'

const buttonRef = ref<ComponentPublicInstance>()
</script>
