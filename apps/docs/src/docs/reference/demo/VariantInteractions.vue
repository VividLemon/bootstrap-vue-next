<template>
  <!-- #region template -->
  <BRow
    ><BCol>Set 'theme': <BBadge theme="success"> testing </BBadge></BCol></BRow
  >
  <BRow
    ><BCol>Set 'bg': <BBadge bg="info"> testing </BBadge></BCol></BRow
  >
  <BRow
    ><BCol
      >Set 'fg' (background is 'secondary' since 'theme' defaults to 'secondary'):
      <BBadge fg="info"> testing </BBadge></BCol
    ></BRow
  >
  <BRow
    ><BCol>Set 'fg' and 'bg': <BBadge fg="primary" bg="danger"> testing </BBadge></BCol></BRow
  >
  <BRow
    ><BCol
      >Set all three - 'theme' is overridden by 'bg' and 'fg':
      <BBadge fg="primary" bg="danger" theme="success"> testing </BBadge></BCol
    ></BRow
  >
  <!-- #endregion template -->
</template>
