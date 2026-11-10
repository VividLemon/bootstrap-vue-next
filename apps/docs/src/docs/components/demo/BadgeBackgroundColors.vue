<template>
  <div class="d-flex mb-4" style="column-gap: 1%">
    <!-- #region template -->
    <BBadge>Primary</BBadge>
    <BBadge :color="{ theme: 'secondary' }">Secondary</BBadge>
    <BBadge :color="{ theme: 'success' }">Success</BBadge>
    <BBadge :color="{ theme: 'danger' }">Danger</BBadge>
    <BBadge :color="{ theme: 'warning' }">Warning</BBadge>
    <BBadge :color="{ theme: 'info' }">Info</BBadge>
    <BBadge :color="{ theme: 'accent' }">Accent</BBadge>
    <BBadge :color="{ theme: 'inverse' }">Inverse</BBadge>
  </div>
  <!-- #endregion template -->
</template>
