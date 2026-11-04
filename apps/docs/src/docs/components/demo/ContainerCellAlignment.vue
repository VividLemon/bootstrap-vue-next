<template>
  <!-- #region template -->
  <BContainer class="bv-example-row bv-example-row-flex-cols">
    <BRow>
      <BCol :align-self="{ xs: 'start' }">One of three columns</BCol>
      <BCol :align-self="{ xs: 'center' }">One of three columns</BCol>
      <BCol :align-self="{ xs: 'end' }">One of three columns</BCol>
    </BRow>
    <BRow>
      <BCol :align-self="{ xs: 'baseline' }">One of three columns</BCol>
      <BCol :align-self="{ xs: 'stretch' }">One of three columns</BCol>
      <BCol :align-self="{ xs: 'auto' }">One of three columns</BCol>
    </BRow>
  </BContainer>

  <!-- #endregion template -->
</template>
