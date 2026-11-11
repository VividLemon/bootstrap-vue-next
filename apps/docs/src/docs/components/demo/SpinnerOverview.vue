<template>
  <!-- #region template -->
  <div class="text-center">
    <BSpinner label="Spinning" class="mx-1" />
    <BSpinner type="grow" label="Spinning" class="mx-1" />
    <BSpinner :color="{ theme: 'primary' }" label="Spinning" class="mx-1" />
    <BSpinner :color="{ theme: 'primary' }" type="grow" label="Spinning" class="mx-1" />
    <BSpinner :color="{ theme: 'success' }" label="Spinning" class="mx-1" />
    <BSpinner :color="{ theme: 'success' }" type="grow" label="Spinning" class="mx-1" />
  </div>
  <!-- #endregion template -->
</template>
