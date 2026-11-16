<template>
  <!-- #region template -->
  <BBreadcrumb>
    <BBreadcrumbItem href="#home"> Home </BBreadcrumbItem>
    <BBreadcrumbDivider />
    <BBreadcrumbItem href="#foo">Foo</BBreadcrumbItem>
    <BBreadcrumbDivider />
    <BBreadcrumbItem href="#bar">Bar</BBreadcrumbItem>
    <BBreadcrumbDivider />
    <BBreadcrumbItem active>Baz</BBreadcrumbItem>
    <template #prepend><span class="mx-2">prepend text</span></template>
    <template #append><span class="mx-2">append text</span></template>
  </BBreadcrumb>
  <!-- #endregion template -->
</template>
