<template>
  <div class="d-flex gap-2">
    <!-- #region template -->
    <BButton>Button</BButton>
    <BButton :color="{ theme: 'danger' }">Button</BButton>
    <BButton :color="{ theme: 'success' }">Button</BButton>
    <BButton variant="outline" :color="{ theme: 'primary' }">Button</BButton>
    <!-- #endregion template -->
  </div>
</template>
