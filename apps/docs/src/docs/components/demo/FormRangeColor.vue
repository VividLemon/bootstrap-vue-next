<template>
  <!-- #region template -->
  <BFormRange :model-value="30" :color="{ theme: 'success' }" aria-label="Success range" />
  <BFormRange :model-value="60" :color="{ theme: 'danger' }" aria-label="Danger range" />
  <BFormRange :model-value="90" disabled aria-label="Disabled range" />
  <!-- #endregion template -->
</template>
