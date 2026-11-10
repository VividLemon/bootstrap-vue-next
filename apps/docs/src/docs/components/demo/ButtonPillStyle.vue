<template>
  <div class="d-flex gap-2">
    <!-- #region template -->
    <BButton pill>Button</BButton>
    <BButton pill :color="{ theme: 'primary' }">Button</BButton>
    <BButton pill variant="outline" :color="{ theme: 'secondary' }">Button</BButton>
    <BButton pill :color="{ theme: 'success' }">Button</BButton>
    <BButton pill variant="outline" :color="{ theme: 'danger' }">Button</BButton>
    <BButton pill :color="{ theme: 'info' }">Button</BButton>
    <!-- #endregion template -->
  </div>
</template>
