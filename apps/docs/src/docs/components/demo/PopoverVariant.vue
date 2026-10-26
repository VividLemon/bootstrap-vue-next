<template>
  <!-- #region template -->
  <div class="d-flex gap-2">
    <BPopover
      title-class="bg-danger fg-contrast-danger"
      class="bg-danger fg-contrast-danger"
      title="Danger!"
      body="Danger variant popover"
    >
      <template #target>
        <BButton>Button</BButton>
      </template>
    </BPopover>
  </div>
  <!-- #endregion template -->
</template>
