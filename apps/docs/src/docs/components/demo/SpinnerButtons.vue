<template>
  <!-- #region template -->
  <BButton :color="{ theme: 'primary' }" disabled class="me-2">
    <BSpinner small />
    <span class="visually-hidden">Loading...</span>
  </BButton>
  <BButton :color="{ theme: 'primary' }" disabled>
    <BSpinner small />
    Loading...
  </BButton>
  <!-- #endregion template -->
</template>
