<template>
  <!-- #region template -->
  <BContainer class="bv-example-row">
    <BRow class="text-center">
      <BCol>1 of 3</BCol>
      <BCol :cols="{ xs: 8 }">2 of 3 (wider)</BCol>
      <BCol>3 of 3</BCol>
    </BRow>

    <BRow class="text-center">
      <BCol>1 of 3</BCol>
      <BCol :cols="{ xs: 5 }">2 of 3 (wider)</BCol>
      <BCol>3 of 3</BCol>
    </BRow>
  </BContainer>
  <!-- #endregion template -->
</template>
