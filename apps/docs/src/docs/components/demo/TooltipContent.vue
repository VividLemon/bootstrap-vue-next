<template>
  <!-- #region template -->
  <div class="d-flex gap-2">
    <BTooltip title="Tooltip Title via Property">
      <template #target>
        <BButton theme="primary">Using property</BButton>
      </template>
    </BTooltip>
    <BTooltip>
      <template #target>
        <BButton theme="primary">Using slot</BButton>
      </template>
      Embedding content <span class="fg-danger">using slots</span> affords you
      <em>greater <strong>control.</strong></em> and HTML support.
    </BTooltip>
  </div>
  <!-- #endregion template -->
</template>
