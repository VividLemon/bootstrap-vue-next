<template>
  <BButton
    v-bind="collapseToggle"
    class="m-1"
    >Toggle Collapse</BButton
  >

  <!-- Element to collapse -->
  <BCollapse id="collapse-2">
    <BCard class="mt-4">I am collapsible content!</BCard>
  </BCollapse>
</template>

<script setup lang="ts">
import {useComponentToggle} from 'bootstrap-vue-next/composables/useComponentToggle'

const {props: collapseToggle} = useComponentToggle('collapse-2')
</script>
