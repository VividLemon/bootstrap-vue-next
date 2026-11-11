<template>
  <!-- #region template -->
  <BContainer class="bv-example-row mb-3">
    <BRow :cols="{ xs: 2 }">
      <BCol>Column</BCol>
      <BCol>Column</BCol>
      <BCol>Column</BCol>
      <BCol>Column</BCol>
    </BRow>
  </BContainer>

  <BContainer class="bv-example-row mb-3">
    <BRow :cols="{ xs: 3 }">
      <BCol>Column</BCol>
      <BCol>Column</BCol>
      <BCol>Column</BCol>
      <BCol>Column</BCol>
    </BRow>
  </BContainer>

  <BContainer class="bv-example-row mb-3">
    <BRow :cols="{ xs: 4 }">
      <BCol>Column</BCol>
      <BCol>Column</BCol>
      <BCol>Column</BCol>
      <BCol>Column</BCol>
    </BRow>
  </BContainer>

  <BContainer class="bv-example-row">
    <BRow :cols="{ xs: 4 }">
      <BCol>Column</BCol>
      <BCol>Column</BCol>
      <BCol :cols="{ xs: 6 }">Column</BCol>
      <BCol>Column</BCol>
    </BRow>
  </BContainer>
  <!-- #endregion template -->
</template>
