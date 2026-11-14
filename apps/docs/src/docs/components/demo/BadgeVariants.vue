<template>
  <div class="d-flex flex-wrap gap-2">
    <!-- #region template -->
    <BBadge :color="{ theme: 'primary' }">Solid</BBadge>
    <BBadge :color="{ theme: 'primary' }" variant="subtle">Subtle</BBadge>
    <BBadge :color="{ theme: 'primary' }" variant="outline">Outline</BBadge>
    <BBadge :color="{ theme: 'success' }" variant="subtle">Success</BBadge>
    <BBadge :color="{ theme: 'danger' }" variant="outline">Danger</BBadge>
    <!-- #endregion template -->
  </div>
</template>
