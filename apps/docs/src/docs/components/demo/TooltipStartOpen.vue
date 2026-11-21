<template>
  <div class="text-center">
    <BTooltip show>
      <template #activator="{ props }">
        <BButton v-bind="props" :color="{ theme: 'primary' }">Button</BButton>
      </template>
      I start <strong>open</strong>
    </BTooltip>
  </div>
</template>
