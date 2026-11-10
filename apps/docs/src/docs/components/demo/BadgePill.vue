<template>
  <div class="d-flex mb-4" style="column-gap: 1%">
    <!-- #region template -->
    <BBadge pill>Primary</BBadge>
    <BBadge pill :color="{ theme: 'secondary' }">Secondary</BBadge>
    <BBadge pill :color="{ theme: 'success' }">Success</BBadge>
    <BBadge pill :color="{ theme: 'danger' }">Danger</BBadge>
    <BBadge pill :color="{ theme: 'warning' }">Warning</BBadge>
    <BBadge pill :color="{ theme: 'info' }">Info</BBadge>
    <BBadge pill :color="{ theme: 'accent' }">Accent</BBadge>
    <BBadge pill :color="{ theme: 'inverse' }">Inverse</BBadge>
    <!-- #endregion template -->
  </div>
</template>
