<template>
  <div>
    <BButton @click="show = true">Open Dialog</BButton>

    <BDialog v-model="show">
      <template #header="{ close }">
        <h5 class="dialog-title">Dialog Header</h5>
        <!-- Same as the built-in header close button -->
        <BButton size="sm" variant="outline" :color="{ theme: 'danger' }" @click="close()">
          Close Dialog
        </BButton>
      </template>

      <template #default="scope">
        <p>Dialog Body with button</p>
        <BButton @click="scope.hide()">Hide Dialog</BButton>
      </template>

      <template #footer="{ ok, cancel, hide }">
        <b class="me-auto">Custom Footer</b>
        <!-- Same as the BDialogActions buttons -->
        <BButton size="sm" :color="{ theme: 'success' }" @click="ok()"> OK </BButton>
        <BButton size="sm" :color="{ theme: 'danger' }" @click="cancel()"> Cancel </BButton>
        <!-- Button with custom close trigger value -->
        <BButton
          size="sm"
          variant="outline"
          :color="{ theme: 'secondary' }"
          @click="hide('forget')"
        >
          Forget it
        </BButton>
      </template>
    </BDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const show = ref(false)
</script>
