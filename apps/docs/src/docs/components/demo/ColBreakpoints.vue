<template>
  <!-- #region template -->
  <BContainer class="bv-example-row">
    <BRow>
      <BCol>col</BCol>
      <BCol>col</BCol>
      <BCol>col</BCol>
      <BCol>col</BCol>
    </BRow>

    <BRow>
      <BCol :cols="{ xs: 8 }">col-8</BCol>
      <BCol :cols="{ xs: 4 }">col-4</BCol>
    </BRow>
  </BContainer>
  <!-- #endregion template -->
</template>
