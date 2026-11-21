<template>
  <!-- #region template -->
  <div class="d-flex gap-2">
    <BTooltip title="Tooltip Title via Property">
      <template #activator="{ props }">
        <BButton v-bind="props" :color="{ theme: 'primary' }">Using property</BButton>
      </template>
    </BTooltip>
    <BTooltip>
      <template #activator="{ props }">
        <BButton v-bind="props" :color="{ theme: 'primary' }">Using slot</BButton>
      </template>
      Embedding content <span class="fg-danger">using slots</span> affords you
      <em>greater <strong>control.</strong></em> and HTML support.
    </BTooltip>
  </div>
  <!-- #endregion template -->
</template>
