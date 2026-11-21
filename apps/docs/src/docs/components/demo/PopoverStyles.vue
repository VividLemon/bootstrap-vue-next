<template>
  <!-- #region template -->
  <div class="d-flex gap-2">
    <BPopover
      title="Danger!"
      style="
        --bs-popover-header-bg: var(--bs-danger-bg);
        --bs-popover-header-color: var(--bs-danger-contrast);
        --bs-popover-bg: var(--bs-danger-bg-subtle);
        --bs-popover-border-color: var(--bs-danger-border);
      "
    >
      <template #activator="{ props }">
        <BButton v-bind="props">Button</BButton>
      </template>
      This is <strong>important</strong>
    </BPopover>
  </div>
  <!-- #endregion template -->
</template>
