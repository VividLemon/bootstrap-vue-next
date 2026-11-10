<template>
  <!-- #region template -->
  <BProgress>
    <BProgressBar :value="15" />
    <BProgressBar :value="30" :color="{ theme: 'success' }" />
    <BProgressBar :value="20" :color="{ theme: 'info' }" />
  </BProgress>
  <!-- #endregion template -->
</template>
