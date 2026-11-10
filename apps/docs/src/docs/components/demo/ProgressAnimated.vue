<template>
  <!-- #region template -->
  <BProgress :color="{ theme: 'success' }" :value="25" striped animated />
  <BProgress class="mt-3" :color="{ theme: 'info' }" :value="50" striped animated />
  <BProgress class="mt-3" :color="{ theme: 'warning' }" :value="75" striped animated />
  <BProgress class="mt-3" :color="{ theme: 'danger' }" :value="100" striped animated />
  <!-- #endregion template -->
</template>
