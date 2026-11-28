<template>
  <!-- #region template -->
  <BGrid :columns="3" :flow="{ xs: 'dense' }" class="bv-example-grid">
    <BGridItem :cols="{ xs: 2 }">1 (span 2)</BGridItem>
    <BGridItem :cols="{ xs: 2 }">2 (span 2)</BGridItem>
    <div>3</div>
    <BGridItem :fill="{ xs: true }">4 (full row)</BGridItem>
    <div>5</div>
  </BGrid>
  <!-- #endregion template -->
</template>
