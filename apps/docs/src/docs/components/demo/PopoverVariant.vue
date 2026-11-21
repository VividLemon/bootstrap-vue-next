<template>
  <!-- #region template -->
  <div class="d-flex gap-2">
    <BPopover
      :title-attrs="{ class: 'bg-danger fg-contrast-danger' }"
      class="bg-danger fg-contrast-danger"
      title="Danger!"
      body="Danger variant popover"
    >
      <template #activator="{ props }">
        <BButton v-bind="props">Button</BButton>
      </template>
    </BPopover>
  </div>
  <!-- #endregion template -->
</template>
