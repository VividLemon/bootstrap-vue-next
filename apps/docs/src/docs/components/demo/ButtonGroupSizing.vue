<template>
  <!-- #region template -->
  <div>
    <BButtonGroup size="sm" aria-label="Large button group">
      <BButton :color="{ theme: 'secondary' }">Left</BButton>
      <BButton :color="{ theme: 'secondary' }">Middle</BButton>
      <BButton :color="{ theme: 'secondary' }">Right</BButton>
    </BButtonGroup>
  </div>
  <div class="mt-3">
    <BButtonGroup :size="undefined" aria-label="Small button group">
      <BButton :color="{ theme: 'secondary' }">Left</BButton>
      <BButton :color="{ theme: 'secondary' }">Middle</BButton>
      <BButton :color="{ theme: 'secondary' }">Right</BButton>
    </BButtonGroup>
  </div>
  <div class="mt-3">
    <BButtonGroup size="lg" aria-label="Large button group">
      <BButton :color="{ theme: 'secondary' }">Left</BButton>
      <BButton :color="{ theme: 'secondary' }">Middle</BButton>
      <BButton :color="{ theme: 'secondary' }">Right</BButton>
    </BButtonGroup>
  </div>
  <!-- #endregion template -->
</template>
