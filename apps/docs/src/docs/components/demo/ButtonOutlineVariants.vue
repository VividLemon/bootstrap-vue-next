<template>
  <div class="d-flex gap-2">
    <!-- #region template -->
    <BButton variant="outline" :color="{ theme: 'primary' }">Primary</BButton>
    <BButton variant="outline" :color="{ theme: 'secondary' }">Secondary</BButton>
    <BButton variant="outline" :color="{ theme: 'success' }">Success</BButton>
    <BButton variant="outline" :color="{ theme: 'danger' }">Danger</BButton>
    <BButton variant="outline" :color="{ theme: 'warning' }">Warning</BButton>
    <BButton variant="outline" :color="{ theme: 'info' }">Info</BButton>
    <BButton variant="outline" :color="{ theme: 'accent' }">Accent</BButton>
    <BButton variant="outline" :color="{ theme: 'inverse' }">Inverse</BButton>
    <!-- #endregion template -->
  </div>
</template>
