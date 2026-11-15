<template>
  <!-- #region template -->
  <div>
    <BButton v-b-modal.my-modal :color="{ theme: 'primary' }">Open Modal</BButton>
    <BDialog id="my-modal" title="Using Modifiers">
      <p>The modal ID is specified as a modifier: <code>.my-modal</code></p>
    </BDialog>
  </div>
  <!-- #endregion template -->
</template>
