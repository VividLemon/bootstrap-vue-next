<template>
  <div class="d-flex flex-column gap-2">
    <BDateField disabled />
    <BDateField readonly :model-value="readonlyValue" />
  </div>
</template>

<script setup lang="ts">
import {CalendarDate} from '@internationalized/date'

const readonlyValue = new CalendarDate(2024, 6, 15)
</script>
