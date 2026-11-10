<template>
  <!-- #region template -->
  <BProgress striped :value="10" />
  <BProgress striped class="mt-3" :color="{ theme: 'success' }" :value="25" />
  <BProgress striped class="mt-3" :color="{ theme: 'info' }" :value="50" />
  <BProgress striped class="mt-3" :color="{ theme: 'warning' }" :value="75" />
  <BProgress striped class="mt-3" :color="{ theme: 'danger' }" :value="100" />
  <!-- #endregion template -->
</template>
