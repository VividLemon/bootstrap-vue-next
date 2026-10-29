<template>
  <!-- #region template -->
  <div class="d-flex gap-2 flex-wrap">
    <BButton v-b-tooltip.click="'Click to toggle'" theme="primary"> Click me </BButton>
    <BButton v-b-tooltip.hover="'Hover to show'" theme="secondary"> Hover me </BButton>
    <BButton v-b-tooltip.focus="'Focus to show'" theme="success"> Focus me </BButton>
  </div>
  <!-- #endregion template -->
</template>
