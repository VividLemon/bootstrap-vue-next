<template>
  <!-- #region template -->
  <div>
    <BButtonGroup aria-label="Basic example">
      <BButton>Button 1</BButton>
      <BButton>Button 2</BButton>
      <BButton>Button 3</BButton>
    </BButtonGroup>
  </div>
  <div class="mt-3">
    <BButtonGroup>
      <BButton :color="{ theme: 'success' }">Success</BButton>
      <BButton :color="{ theme: 'info' }">Info</BButton>
      <BButton :color="{ theme: 'warning' }">Warning</BButton>
    </BButtonGroup>
  </div>
  <!-- #endregion template -->
</template>
