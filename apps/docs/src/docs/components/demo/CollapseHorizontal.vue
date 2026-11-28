<template>
  <BButton
    v-bind="collapseHorizontalToggle"
    class="m-1"
    >Toggle Horizontal Collapse</BButton
  >

  <div style="min-height: 120px">
    <BCollapse
      id="collapse-horizontal"
      horizontal
    >
      <BCard style="width: 300px"> I collapse horizontally instead of vertically. </BCard>
    </BCollapse>
  </div>
</template>

<script setup lang="ts">
import {useComponentToggle} from 'bootstrap-vue-next/composables/useComponentToggle'

const {props: collapseHorizontalToggle} = useComponentToggle('collapse-horizontal')
</script>
