<template>
  <BButton v-bind="collapseToggle">Toggle Collapse</BButton>
  <BCollapse id="aria-demo-toggle">
    <BCard>Collapsible content</BCard>
  </BCollapse>
</template>

<script setup lang="ts">
import {useComponentToggle} from 'bootstrap-vue-next/composables/useComponentToggle'

const {props: collapseToggle} = useComponentToggle('aria-demo-toggle')
</script>
