<template>
  <div>
    <div class="d-flex gap-2">
      <!-- Using modifiers -->
      <BButton v-b-toggle.directive-dialog>Show Dialog</BButton>

      <!-- Using value -->
      <BButton v-b-toggle="'directive-dialog'">Show Dialog</BButton>
    </div>
    <!-- The dialog -->
    <BDialog id="directive-dialog" title="Opened by v-b-toggle">Hello From My Dialog!</BDialog>
  </div>
</template>

<script setup lang="ts">
import { vBToggle } from 'bootstrap-vue-next/directives/BToggle'
</script>
