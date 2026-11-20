<template>
  <!-- #region template -->
  <BGrid :columns="3" class="bv-example-grid">
    <BGridItem>
      First auto-column
      <BGrid :columns="3">
        <div>Auto-column</div>
        <div>Auto-column</div>
      </BGrid>
    </BGridItem>
    <BGridItem>
      Second auto-column
      <BGrid>
        <BGridItem :cols="{ xs: 6 }">6 of 12</BGridItem>
        <BGridItem :cols="{ xs: 4 }">4 of 12</BGridItem>
        <BGridItem :cols="{ xs: 2 }">2 of 12</BGridItem>
      </BGrid>
    </BGridItem>
    <BGridItem>Third auto-column</BGridItem>
  </BGrid>
  <!-- #endregion template -->
</template>
