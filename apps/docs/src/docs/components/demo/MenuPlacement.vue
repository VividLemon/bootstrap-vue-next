<template>
  <!-- #region template -->
  <div class="d-flex flex-wrap gap-2">
    <BMenu
      v-for="placement in placements"
      :key="placement"
      :text="placement"
      :placement="placement"
    >
      <BMenuItem>Action</BMenuItem>
      <BMenuItem>Another action</BMenuItem>
    </BMenu>
  </div>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import type { MenuPlacement } from 'bootstrap-vue-next'

const placements: MenuPlacement[] = [
  'bottom-start',
  'bottom-end',
  'top-start',
  'top-end',
  'start',
  'end',
]
</script>
