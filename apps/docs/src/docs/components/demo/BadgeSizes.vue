<template>
  <div class="d-flex flex-wrap align-items-center gap-2">
    <!-- #region template -->
    <BBadge :color="{ theme: 'primary' }">Default</BBadge>
    <BBadge :color="{ theme: 'primary' }" size="lg">Large</BBadge>
    <BBadge :color="{ theme: 'primary' }" variant="subtle" size="lg">Large subtle</BBadge>
    <!-- #endregion template -->
  </div>
</template>
