<template>
  <div class="d-flex flex-column gap-2">
    <BTimeField disabled />
    <BTimeField readonly :model-value="readonlyValue" />
  </div>
</template>

<script setup lang="ts">
import {Time} from '@internationalized/date'

const readonlyValue = new Time(9, 30)
</script>
