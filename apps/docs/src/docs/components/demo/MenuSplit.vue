<template>
  <!-- #region template -->
  <BMenu split text="Split menu" @split-click="clicks++">
    <BMenuItem>Action</BMenuItem>
    <BMenuItem>Another action</BMenuItem>
    <BMenuItem>Something else here</BMenuItem>
  </BMenu>
  <p class="mt-2">Main button clicks: {{ clicks }}</p>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import { ref } from 'vue'

const clicks = ref(0)
</script>
