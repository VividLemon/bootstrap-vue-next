<template>
  <!-- #region template -->
  <BButton
    v-b-tooltip.hover.top="{
      title: 'Tooltip title',
      delay: { show: 500, hide: 100 },
    }"
    :color="{ theme: 'primary' }"
  >
    Object configuration
  </BButton>
  <!-- #endregion template -->
</template>
