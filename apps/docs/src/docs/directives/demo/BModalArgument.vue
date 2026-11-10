<template>
  <!-- #region template -->
  <div>
    <BButton v-b-modal:modal-arg :color="{ theme: 'primary' }">Open Modal</BButton>
    <BModal id="modal-arg" title="Using Directive Argument">
      <p>The modal ID is specified as an argument: <code>:modal-arg</code></p>
    </BModal>
  </div>
  <!-- #endregion template -->
</template>
