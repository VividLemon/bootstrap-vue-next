<template>
  <!-- #region template -->
  <BGrid :columns="4" gap=".25rem 1rem" class="bv-example-grid">
    <BGridItem :cols="{ xs: 4, md: 2 }">.g-col-4 .md:g-col-2</BGridItem>
    <BGridItem :cols="{ xs: 4, md: 2 }" :start="{ md: 3 }"
      >.g-col-4 .md:g-col-2 .md:g-start-3</BGridItem
    >
    <div>auto</div>
    <div>auto</div>
  </BGrid>
  <!-- #endregion template -->
</template>
