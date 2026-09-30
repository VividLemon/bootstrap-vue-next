<template>
  <BDateRangeField :is-date-unavailable="isDateUnavailable" />
  <div class="form-text">Weekends cannot be selected</div>
</template>

<script setup lang="ts">
import type {DateValue} from '@internationalized/date'

const isDateUnavailable = (date: DateValue) => {
  const dayOfWeek = date.toDate('UTC').getUTCDay()
  return dayOfWeek === 0 || dayOfWeek === 6
}
</script>
