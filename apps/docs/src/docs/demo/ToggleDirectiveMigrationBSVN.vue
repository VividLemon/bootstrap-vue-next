<template>
  <BButton v-bind="collapseToggle">Toggle</BButton>
  <BButton v-bind="modalToggle">Show Dialog</BButton>
  <BButton v-bind="bothToggle">Toggle both</BButton>

  <BCollapse id="my-collapse">
    <BCard class="mt-2">My collapse</BCard>
  </BCollapse>
  <BCollapse id="collapse-a">
    <BCard class="mt-2">Collapse A</BCard>
  </BCollapse>
  <BCollapse id="collapse-b">
    <BCard class="mt-2">Collapse B</BCard>
  </BCollapse>
  <BDialog
    id="my-modal"
    title="My dialog"
    >Hello from my dialog!</BDialog
  >
</template>

<script setup lang="ts">
import {useComponentToggle} from 'bootstrap-vue-next/composables/useComponentToggle'

const {props: collapseToggle} = useComponentToggle('my-collapse')
const {props: modalToggle} = useComponentToggle('my-modal')
const {props: bothToggle} = useComponentToggle(['collapse-a', 'collapse-b'])
</script>
