<template>
  <!-- #region template -->
  <BBreadcrumb>
    <BBreadcrumbItem href="#home"> Home </BBreadcrumbItem>
    <li class="breadcrumb-divider" />
    <BBreadcrumbItem href="#foo">Foo</BBreadcrumbItem>
    <li class="breadcrumb-divider" />
    <BBreadcrumbItem href="#bar">Bar</BBreadcrumbItem>
    <li class="breadcrumb-divider" />
    <BBreadcrumbItem active>Baz</BBreadcrumbItem>
    <template #prepend><span class="mx-2">prepend text</span></template>
    <template #append><span class="mx-2">append text</span></template>
  </BBreadcrumb>
  <!-- #endregion template -->
</template>
