<template>
  <div class="d-flex gap-2">
    <BButton v-bind="singleToggle">Toggle the first collapse</BButton>
    <BButton v-bind="bothToggle">Toggle both collapses</BButton>
  </div>
  <BCollapse id="toggle-trigger-a">
    <BCard class="mt-2">First collapse</BCard>
  </BCollapse>
  <BCollapse id="toggle-trigger-b">
    <BCard class="mt-2">Second collapse</BCard>
  </BCollapse>
</template>

<script setup lang="ts">
import {useComponentToggle} from 'bootstrap-vue-next/composables/useComponentToggle'

const {props: singleToggle} = useComponentToggle('toggle-trigger-a')
// An array of ids, or a space-separated string of them
const {props: bothToggle} = useComponentToggle(['toggle-trigger-a', 'toggle-trigger-b'])
</script>
