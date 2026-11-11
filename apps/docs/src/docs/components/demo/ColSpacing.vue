<template>
  <!-- #region template -->
  <BContainer fluid class="fg-white text-center">
    <BRow class="mb-3">
      <BCol :cols="{ md: 4 }" class="p-3 bg-info">md:col-4</BCol>
      <BCol :cols="{ md: 4 }" class="ms-auto p-3 bg-info">md:col-4 .ms-auto</BCol>
    </BRow>

    <BRow class="mb-3">
      <BCol :cols="{ md: 3 }" class="md:ms-auto p-3 bg-info">md:col-3 .md:ms-auto</BCol>
      <BCol :cols="{ md: 3 }" class="md:ms-auto p-3 bg-info">md:col-3 .md:ms-auto</BCol>
    </BRow>

    <BRow>
      <BCol :cols="{ xs: 'auto' }" class="me-auto p-3 bg-info">col-auto .me-auto</BCol>
      <BCol :cols="{ xs: 'auto' }" class="me-auto p-3 bg-info">col-auto .me-auto</BCol>
      <BCol :cols="{ xs: 'auto' }" class="p-3 bg-info">col-auto</BCol>
    </BRow>
  </BContainer>
  <!-- #endregion template -->
</template>
