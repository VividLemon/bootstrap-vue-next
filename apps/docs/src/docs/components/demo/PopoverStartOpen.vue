<template>
  <div class="text-center">
    <BPopover show title="Popover">
      <template #activator="{ props }">
        <BButton v-bind="props" :color="{ theme: 'primary' }">Button</BButton>
      </template>
      I start <strong>open</strong>
    </BPopover>
  </div>
</template>
