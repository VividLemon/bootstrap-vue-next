<template>
  <!-- #region template -->
  <BRow
    ><BCol>Set 'theme': <BBadge :color="{ theme: 'success' }"> testing </BBadge></BCol></BRow
  >
  <BRow
    ><BCol>Set 'bg': <BBadge :color="{ bg: 'info' }"> testing </BBadge></BCol></BRow
  >
  <BRow
    ><BCol
      >Set 'fg' (background is 'secondary' since 'theme' defaults to 'secondary'):
      <BBadge :color="{ fg: 'info' }"> testing </BBadge></BCol
    ></BRow
  >
  <BRow
    ><BCol>Set 'fg' and 'bg': <BBadge :color="{ fg: 'primary', bg: 'danger' }"> testing </BBadge></BCol></BRow
  >
  <BRow
    ><BCol
      >Set all three - 'theme' is overridden by 'bg' and 'fg':
      <BBadge :color="{ fg: 'primary', bg: 'danger', theme: 'success' }"> testing </BBadge></BCol
    ></BRow
  >
  <!-- #endregion template -->
</template>
