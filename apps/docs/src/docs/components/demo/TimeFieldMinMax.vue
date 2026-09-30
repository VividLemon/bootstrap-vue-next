<template>
  <BTimeField :min-value="minValue" :max-value="maxValue" />
  <div class="form-text">Only allows times between 09:00 and 17:00</div>
</template>

<script setup lang="ts">
import {Time} from '@internationalized/date'

const minValue = new Time(9, 0)
const maxValue = new Time(17, 0)
</script>
