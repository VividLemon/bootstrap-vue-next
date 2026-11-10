<template>
  <!-- #region template -->
  <div class="d-flex gap-2 flex-wrap justify-content-center">
    <BButton v-b-tooltip.top="'Tooltip on top'" :color="{ theme: 'primary' }"> Top </BButton>
    <BButton v-b-tooltip.bottom="'Tooltip on bottom'" :color="{ theme: 'secondary' }">
      Bottom
    </BButton>
    <BButton v-b-tooltip.left="'Tooltip on left'" :color="{ theme: 'success' }"> Left </BButton>
    <BButton v-b-tooltip.right="'Tooltip on right'" :color="{ theme: 'danger' }"> Right </BButton>
  </div>
  <!-- #endregion template -->
</template>
