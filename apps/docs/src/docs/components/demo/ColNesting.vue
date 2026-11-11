<template>
  <!-- #region template -->
  <BContainer
    fluid
    class="bv-example-row"
  >
    <BRow>
      <BCol :cols="{ sm: 9 }">
        Level 1: sm:col-9
        <BRow>
          <BCol
            :cols="{ xs: 8, sm: 6 }"
            >Level 2: col-8 sm:col-6</BCol
          >
          <BCol
            :cols="{ xs: 4, sm: 6 }"
            >Level 2: col-4 sm:col-6</BCol
          >
        </BRow>
      </BCol>
    </BRow>
  </BContainer>
  <!-- #endregion template -->
</template>
