<template>
  <div class="d-flex gap-2">
    <!-- An array of ids -->
    <BButton v-bind="arrayToggle">Toggle Collapse A and B</BButton>
    <!-- A space-separated string of ids -->
    <BButton v-bind="stringToggle">Toggle Collapse A and B</BButton>
  </div>
  <!-- Elements to collapse -->
  <BCollapse id="collapse-a">
    <BCard class="mt-4">I am collapsible content A!</BCard>
  </BCollapse>
  <BCollapse id="collapse-b">
    <BCard class="mt-4">I am collapsible content B!</BCard>
  </BCollapse>
</template>

<script setup lang="ts">
import {useComponentToggle} from 'bootstrap-vue-next/composables/useComponentToggle'

const {props: arrayToggle} = useComponentToggle(['collapse-a', 'collapse-b'])
const {props: stringToggle} = useComponentToggle('collapse-a collapse-b')
</script>
