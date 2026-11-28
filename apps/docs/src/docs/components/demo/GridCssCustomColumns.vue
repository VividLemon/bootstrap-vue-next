<template>
  <!-- #region template -->
  <BGrid :columns="18" class="bv-example-grid">
    <BGridItem :cols="{ xs: 6 }">.g-col-6</BGridItem>
    <BGridItem :cols="{ xs: 6 }">.g-col-6</BGridItem>
    <BGridItem :cols="{ xs: 6 }">.g-col-6</BGridItem>
    <BGridItem style="grid-column: auto / span 14">span 14</BGridItem>
    <BGridItem :cols="{ xs: 4 }">.g-col-4</BGridItem>
  </BGrid>
  <!-- #endregion template -->
</template>
