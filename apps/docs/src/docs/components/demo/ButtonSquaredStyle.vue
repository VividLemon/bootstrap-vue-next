<template>
  <div class="d-flex gap-2">
    <!-- #region template -->
    <BButton squared>Button</BButton>
    <BButton squared :color="{ theme: 'primary' }">Button</BButton>
    <BButton squared variant="outline" :color="{ theme: 'secondary' }">Button</BButton>
    <BButton squared :color="{ theme: 'success' }">Button</BButton>
    <BButton squared variant="outline" :color="{ theme: 'danger' }">Button</BButton>
    <BButton squared :color="{ theme: 'info' }">Button</BButton>
    <!-- #endregion template -->
  </div>
</template>
