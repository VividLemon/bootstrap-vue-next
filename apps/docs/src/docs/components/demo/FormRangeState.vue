<template>
  <!-- #region template -->
  <BFormRange :model-value="80" :state="true" aria-label="Valid range" />
  <BFormRange :model-value="10" :state="false" aria-label="Invalid range" />
  <div class="invalid-feedback">Pick a higher value.</div>
  <!-- #endregion template -->
</template>
