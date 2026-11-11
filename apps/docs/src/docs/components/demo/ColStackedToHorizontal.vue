<template>
  <!-- #region template -->
  <BContainer class="bv-example-row">
    <BRow>
      <BCol :cols="{ sm: 8 }">sm:col-8</BCol>
      <BCol :cols="{ sm: 4 }">sm:col-4</BCol>
    </BRow>

    <BRow>
      <BCol :cols="{ sm: true }">sm:col</BCol>
      <BCol :cols="{ sm: true }">sm:col</BCol>
      <BCol :cols="{ sm: true }">sm:col</BCol>
    </BRow>
  </BContainer>
  <!-- #endregion template -->
</template>
