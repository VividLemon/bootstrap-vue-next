<template>
  <BAlert variant="info" :model-value="true">
    {{ withNoteTextPrepend === true ? 'Note: ' : '' }}<slot />
  </BAlert>
</template>

<script setup lang="ts">
import {BAlert} from 'bootstrap-vue-next/components/BAlert'

withDefaults(
  defineProps<{
    withNoteTextPrepend?: boolean
  }>(),
  {withNoteTextPrepend: true}
)
</script>
