<template>
  <div>
    <BButton @click="open = !open">Launch demo dialog</BButton>

    <BDialog v-model="open" title="Initial focus">
      <BFormInput class="mb-2" placeholder="Not focused" />
      <!-- The browser focuses the element with `autofocus` when the dialog opens -->
      <BFormInput autofocus placeholder="Focused on open" />
    </BDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
</script>
