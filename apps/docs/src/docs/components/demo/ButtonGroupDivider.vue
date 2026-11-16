<template>
  <!-- #region template -->
  <BButtonGroup divider aria-label="Button group with dividers">
    <BButton :color="{ theme: 'primary' }">Left</BButton>
    <BButton :color="{ theme: 'primary' }">Middle</BButton>
    <BButton :color="{ theme: 'primary' }">Right</BButton>
  </BButtonGroup>
  <BButtonGroup divider vertical class="ms-3" aria-label="Vertical button group with dividers">
    <BButton :color="{ theme: 'primary' }">Top</BButton>
    <BButton :color="{ theme: 'primary' }">Middle</BButton>
    <BButton :color="{ theme: 'primary' }">Bottom</BButton>
  </BButtonGroup>
  <!-- #endregion template -->
</template>
