<template>
  <BButton
    v-bind="collapse1Toggle"
    :color="{theme: 'primary'}"
    >Toggle Collapse</BButton
  >

  <BCollapse id="collapse-1">
    <BCard class="mt-4">
      <p class="card-text">Collapse contents Here</p>
      <BButton
        v-bind="collapse1InnerToggle"
        size="sm"
        >Toggle Inner Collapse</BButton
      >
      <BCollapse id="collapse-1-inner">
        <BCard class="mt-4">Hello!</BCard>
      </BCollapse>
    </BCard>
  </BCollapse>
</template>

<script setup lang="ts">
import {useComponentToggle} from 'bootstrap-vue-next/composables/useComponentToggle'

const {props: collapse1Toggle} = useComponentToggle('collapse-1')
const {props: collapse1InnerToggle} = useComponentToggle('collapse-1-inner')
</script>
