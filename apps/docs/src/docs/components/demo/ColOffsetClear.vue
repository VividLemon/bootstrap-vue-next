<template>
  <!-- #region template -->
  <BContainer
    fluid
    class="bv-example-row"
  >
    <BRow>
      <BCol
        :cols="{ sm: 5, md: 6 }"
        >sm:col-5 md:col-6</BCol
      >
      <BCol
        :cols="{ sm: 5, md: 6 }"
        :offset="{ sm: 2, md: 0 }"
        >sm:col-5 md:col-6 sm:offset-2 md:offset-0</BCol
      >
    </BRow>

    <BRow>
      <BCol
        :cols="{ sm: 6, md: 5, lg: 6 }"
        >sm:col-6 md:col-5 lg:col-6</BCol
      >
      <BCol
        :cols="{ sm: 6, md: 5, lg: 6 }"
        :offset="{ md: 2, lg: 0 }"
        >sm:col-6 md:col-5 lg:col-6 md:offset-2 lg:offset-0</BCol
      >
    </BRow>
  </BContainer>
  <!-- #endregion template -->
</template>
