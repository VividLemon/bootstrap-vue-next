<template>
  <!-- Using modifiers -->
  <BButton
    v-bind="collapse3Toggle"
    class="m-1"
    >Toggle Collapse</BButton
  >

  <BCollapse
    id="collapse-3"
    visible
  >
    <BCard class="mt-4">I should start open!</BCard>
  </BCollapse>
</template>

<script setup lang="ts">
import {useComponentToggle} from 'bootstrap-vue-next/composables/useComponentToggle'

const {props: collapse3Toggle} = useComponentToggle('collapse-3')
</script>
