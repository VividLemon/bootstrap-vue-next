<template>
  <BTimeRangeField :is-time-unavailable="isTimeUnavailable" />
  <div class="form-text">The 12:00–13:00 lunch slot is unavailable</div>
</template>

<script setup lang="ts">
import type {DateValue} from '@internationalized/date'

const isTimeUnavailable = (date: DateValue) => date.toDate('UTC').getUTCHours() === 12
</script>
