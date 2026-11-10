<template>
  <!-- #region template -->
  <div class="d-flex gap-2 flex-wrap">
    <BButton v-b-tooltip.click="'Click to toggle'" :color="{ theme: 'primary' }">
      Click me
    </BButton>
    <BButton v-b-tooltip.hover="'Hover to show'" :color="{ theme: 'secondary' }">
      Hover me
    </BButton>
    <BButton v-b-tooltip.focus="'Focus to show'" :color="{ theme: 'success' }"> Focus me </BButton>
  </div>
  <!-- #endregion template -->
</template>
