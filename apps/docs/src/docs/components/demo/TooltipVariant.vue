<template>
  <!-- #region template -->
  <BTooltip :title-attrs="{ class: 'bg-danger fg-contrast-danger' }" title="Danger variant tooltip">
    <template #activator="{ props }">
      <BButton v-bind="props">Button</BButton>
    </template>
  </BTooltip>
  <!-- #endregion template -->
</template>
