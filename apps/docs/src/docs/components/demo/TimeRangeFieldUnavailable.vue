<template>
  <BTimeRangeField :is-time-unavailable="isTimeUnavailable" />
  <div class="form-text">The 12:00–13:00 lunch slot is unavailable</div>
</template>

<script setup lang="ts">
import type {Time} from '@internationalized/date'

const isTimeUnavailable = (time: Time) => time.hour === 12
</script>
