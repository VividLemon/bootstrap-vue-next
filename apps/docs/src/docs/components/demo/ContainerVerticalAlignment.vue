<template>
  <!-- #region template -->
  <BContainer class="bv-example-row bv-example-row-flex-cols">
    <BRow :align-v="{ xs: 'start' }">
      <BCol>One of three columns</BCol>
      <BCol>One of three columns</BCol>
      <BCol>One of three columns</BCol>
    </BRow>

    <BRow :align-v="{ xs: 'center' }">
      <BCol>One of three columns</BCol>
      <BCol>One of three columns</BCol>
      <BCol>One of three columns</BCol>
    </BRow>

    <BRow :align-v="{ xs: 'end' }">
      <BCol>One of three columns</BCol>
      <BCol>One of three columns</BCol>
      <BCol>One of three columns</BCol>
    </BRow>

    <BRow :align-v="{ xs: 'baseline' }">
      <BCol style="font-size: 0.75rem">One of three columns</BCol>
      <BCol>One of three columns</BCol>
      <BCol style="font-size: 1.25rem">One of three columns</BCol>
    </BRow>

    <BRow :align-v="{ xs: 'stretch' }">
      <BCol>One of three columns</BCol>
      <BCol>One of three columns</BCol>
      <BCol>One of three columns</BCol>
    </BRow>
  </BContainer>
  <!-- #endregion template -->
</template>
