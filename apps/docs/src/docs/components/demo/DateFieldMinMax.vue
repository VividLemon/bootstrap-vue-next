<template>
  <BDateField :min-value="minValue" :max-value="maxValue" :default-value="today" />
  <div class="form-text">Only allows dates within the current month</div>
</template>

<script setup lang="ts">
import {CalendarDate, getLocalTimeZone, today as todayFn} from '@internationalized/date'

const today = todayFn(getLocalTimeZone())
const minValue = new CalendarDate(today.year, today.month, 1)
const maxValue = today.set({day: today.calendar.getDaysInMonth(today)})
</script>
