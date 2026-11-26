<template>
  <BButton id="advanced-popover-activator" @click="showAdvancedPopover">
    Toggle advanced popover
  </BButton>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { BButton } from 'bootstrap-vue-next/components/BButton'
import { usePopover } from 'bootstrap-vue-next/composables/usePopover'

const { popover } = usePopover()

const showAdvancedPopover = async () => {
  await using _ = await popover(
    {
      activator: 'advanced-popover-activator',
      title: 'Advanced Popover',
    },
    {
      slots: {
        default: (scope) => h('div', null, `Custom content - Visible: ${scope.visible}`),
      },
    },
  ).show()
}
</script>
