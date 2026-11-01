<template>
  <!-- #region template -->
  <BContainer class="bv-example-row">
    <BRow :align-h="{ xs: 'start' }">
      <BCol :cols="{ xs: 4 }">One of two columns</BCol>
      <BCol :cols="{ xs: 4 }">One of two columns</BCol>
    </BRow>

    <BRow :align-h="{ xs: 'center' }">
      <BCol :cols="{ xs: 4 }">One of two columns</BCol>
      <BCol :cols="{ xs: 4 }">One of two columns</BCol>
    </BRow>

    <BRow :align-h="{ xs: 'end' }">
      <BCol :cols="{ xs: 4 }">One of two columns</BCol>
      <BCol :cols="{ xs: 4 }">One of two columns</BCol>
    </BRow>

    <BRow :align-h="{ xs: 'around' }">
      <BCol :cols="{ xs: 4 }">One of two columns</BCol>
      <BCol :cols="{ xs: 4 }">One of two columns</BCol>
    </BRow>

    <BRow :align-h="{ xs: 'between' }">
      <BCol :cols="{ xs: 4 }">One of two columns</BCol>
      <BCol :cols="{ xs: 4 }">One of two columns</BCol>
    </BRow>

    <BRow :align-h="{ xs: 'evenly' }">
      <BCol :cols="{ xs: 4 }">One of two columns</BCol>
      <BCol :cols="{ xs: 4 }">One of two columns</BCol>
    </BRow>
  </BContainer>
  <!-- #endregion template -->
</template>
