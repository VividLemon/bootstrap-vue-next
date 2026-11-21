<template>
  <!-- #region template -->
  <div class="d-flex gap-2">
    <BTooltip :body-attrs="{ class: 'my-tooltip-body-class' }">
      <template #activator="{ props }">
        <BButton v-bind="props" href="#tooltip-custom-class" tabindex="0">Button</BButton>
      </template>
      My tooltip
    </BTooltip>
    <BTooltip title="My tooltip" :title-attrs="{ class: 'my-tooltip-title-class' }">
      <template #activator="{ props }">
        <BButton v-bind="props" href="#tooltip-custom-class" tabindex="1">Button</BButton>
      </template>
    </BTooltip>
  </div>
  <!-- #endregion template -->
</template>
