<template>
  <BContainer fluid>
    <BRow>
      <BCol>
        <BTooltip placement="top" :title="tooltip">
          <template #activator="{props}">
            <BButton v-bind="props">Tooltip on top</BButton>
          </template>
        </BTooltip>
        <BButton @click="setTooltip">Change tooltip</BButton>
        <BTooltip placement="left" title="Tooltip on left">
          <template #activator="{props}">
            <BButton v-bind="props">Tooltip on left</BButton>
          </template>
        </BTooltip>
        <BTooltip placement="right" click title="Tooltip on right">
          <template #activator="{props}">
            <BButton v-bind="props">Tooltip on right</BButton>
          </template>
        </BTooltip>
        <BTooltip placement="bottom" title="Tooltip on bottom">
          <template #activator="{props}">
            <BButton v-bind="props">Tooltip on bottom</BButton>
          </template>
        </BTooltip>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const tooltip = ref('Tooltip on <em>top</em>')
const setTooltip = () => {
  tooltip.value = `${new Date()} <strong>fechaaa</strong>`
}
</script>
