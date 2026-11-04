<template>
  <!-- #region template -->
  <BContainer class="bv-example-row">
    <BRow :align-h="{ md: 'center' }">
      <BCol :cols="{ xs: true, lg: 2 }">1 of 3</BCol>
      <BCol :cols="{ xs: 12, md: 'auto' }">Variable width content</BCol>
      <BCol :cols="{ xs: true, lg: 2 }">3 of 3</BCol>
    </BRow>

    <BRow>
      <BCol>1 of 3</BCol>
      <BCol :cols="{ xs: 12, md: 'auto' }">Variable width content</BCol>
      <BCol :cols="{ xs: true, lg: 2 }">3 of 3</BCol>
    </BRow>
  </BContainer>
  <!-- #endregion template -->
</template>
