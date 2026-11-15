<template>
  <!-- #region template -->
  <div>
    <BButton v-b-modal.modal-overview :color="{ theme: 'primary' }">Show Modal</BButton>
    <BDialog id="modal-overview" title="Hello Modal!">
      <p>This modal can be triggered with the v-b-modal directive.</p>
    </BDialog>
  </div>
  <!-- #endregion template -->
</template>
