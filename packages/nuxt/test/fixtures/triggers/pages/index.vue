<template>
  <div id="triggers-page">
    <BTooltip title="A tooltip" hover>
      <template #activator="{props}">
        <span id="tooltip-el" v-bind="props">Tooltip target</span>
      </template>
    </BTooltip>
    <BButton id="modal-trigger" v-bind="modalToggle.props.value"> Open dialog </BButton>
    <BDialog id="my-modal" title="Toggled modal"> Toggled modal body </BDialog>
    <BPopover title="A popover" hover>
      <template #activator="{props}">
        <span id="popover-el" v-bind="props">Popover target</span>
      </template>
    </BPopover>
  </div>
</template>

<script setup lang="ts">
import {useComponentToggle} from 'bootstrap-vue-next/composables/useComponentToggle'

defineOptions({name: 'TriggersIndex'})

const modalToggle = useComponentToggle('my-modal')
</script>
