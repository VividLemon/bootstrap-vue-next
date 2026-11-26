<template>
  <!-- #region template -->
  <BBreadcrumb :items="['Home', 'Library', 'Data']">
    <template #divider>/</template>
  </BBreadcrumb>

  <BBreadcrumb>
    <BBreadcrumbItem href="#home">Home</BBreadcrumbItem>
    <BBreadcrumbDivider>&raquo;</BBreadcrumbDivider>
    <BBreadcrumbItem href="#library">Library</BBreadcrumbItem>
    <BBreadcrumbDivider>&raquo;</BBreadcrumbDivider>
    <BBreadcrumbItem active>Data</BBreadcrumbItem>
  </BBreadcrumb>
  <!-- #endregion template -->
</template>
