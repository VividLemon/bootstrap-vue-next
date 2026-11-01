<template>
  <!-- #region template -->
  <BContainer
    fluid
    class="bv-example-row"
  >
    <BRow>
      <BCol :cols="{ md: 4 }">md:col-4</BCol>
      <BCol
        :cols="{ md: 4 }"
        :offset="{ md: 4 }"
        >md:col-4 md:offset-4</BCol
      >
    </BRow>

    <BRow>
      <BCol
        :cols="{ md: 3 }"
        :offset="{ md: 3 }"
        >md:col-3 md:offset-3</BCol
      >
      <BCol
        :cols="{ md: 3 }"
        :offset="{ md: 3 }"
        >md:col-3 md:offset-3</BCol
      >
    </BRow>

    <BRow>
      <BCol
        :cols="{ md: 6 }"
        :offset="{ md: 3 }"
        >md:col-6 md:offset-3</BCol
      >
    </BRow>
  </BContainer>
  <!-- #endregion template -->
</template>
