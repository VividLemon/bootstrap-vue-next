<template>
  <BDatePicker :is-date-disabled="isDateDisabled" :is-date-unavailable="isDateUnavailable" />
  <div class="form-text">Weekends are disabled, the 1st of the month is unavailable</div>
</template>

<script setup lang="ts">
import type {DateValue} from '@internationalized/date'

const isDateDisabled = (date: DateValue) => {
  const dayOfWeek = date.toDate('UTC').getUTCDay()
  return dayOfWeek === 0 || dayOfWeek === 6
}

const isDateUnavailable = (date: DateValue) => date.day === 1
</script>
