<template>
  <!-- #region template -->
  <BPopover>
    <template #activator="{ props }">
      <BButton v-bind="props">Hover Me</BButton>
    </template>
    <template #title>Popover Title</template>
    I am popover <b>component</b> content!
  </BPopover>
  <!-- #endregion template -->
</template>
