<template>
  <!-- #region template -->
  <div>
    <BButtonGroup size="sm" aria-label="Large button group">
      <BButton theme="secondary">Left</BButton>
      <BButton theme="secondary">Middle</BButton>
      <BButton theme="secondary">Right</BButton>
    </BButtonGroup>
  </div>
  <div class="mt-3">
    <BButtonGroup :size="undefined" aria-label="Small button group">
      <BButton theme="secondary">Left</BButton>
      <BButton theme="secondary">Middle</BButton>
      <BButton theme="secondary">Right</BButton>
    </BButtonGroup>
  </div>
  <div class="mt-3">
    <BButtonGroup size="lg" aria-label="Large button group">
      <BButton theme="secondary">Left</BButton>
      <BButton theme="secondary">Middle</BButton>
      <BButton theme="secondary">Right</BButton>
    </BButtonGroup>
  </div>
  <!-- #endregion template -->
</template>
