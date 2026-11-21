<template>
  <!-- #region template -->
  <div class="d-flex gap-2">
    <BPopover
      :title-attrs="{ class: 'my-popover-title-class' }"
      :body-attrs="{ class: 'my-popover-body-class' }"
    >
      <template #activator="{ props }">
        <BButton v-bind="props" href="#popover-custom-class" tabindex="0">Button</BButton>
      </template>
      <template #title>Popover Title</template>
      Popover content
    </BPopover>
  </div>
  <!-- #endregion template -->
</template>
