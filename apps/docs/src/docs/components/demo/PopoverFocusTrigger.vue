<template>
  <!-- #region template -->
  <div class="d-flex gap-2">
    <BPopover focus title="Focus Trigger">
      <template #activator="{ props }">
        <BButton v-bind="props" href="#" tabindex="0" :color="{ theme: 'primary' }">
          Link button with focus trigger
        </BButton>
      </template>
      This popover is triggered by focus events
    </BPopover>
  </div>
  <!-- #endregion template -->
</template>
