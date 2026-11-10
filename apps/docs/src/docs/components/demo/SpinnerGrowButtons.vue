<template>
  <!-- #region template -->
  <BButton :color="{ theme: 'primary' }" disabled class="me-2">
    <BSpinner small type="grow" />
    <span class="visually-hidden">Loading...</span>
  </BButton>
  <BButton :color="{ theme: 'primary' }" disabled>
    <BSpinner small type="grow" />
    Loading...
  </BButton>
  <!-- #endregion template -->
</template>
