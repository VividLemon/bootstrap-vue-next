<template>
  <!-- #region template -->
  <BListGroup>
    <BListGroupItem>Default list group item</BListGroupItem>
    <BListGroupItem :color="{ theme: 'primary' }">Primary list group item</BListGroupItem>
    <BListGroupItem :color="{ theme: 'secondary' }">Secondary list group item</BListGroupItem>
    <BListGroupItem :color="{ theme: 'success' }">Success list group item</BListGroupItem>
    <BListGroupItem :color="{ theme: 'danger' }">Danger list group item</BListGroupItem>
    <BListGroupItem :color="{ theme: 'warning' }">Warning list group item</BListGroupItem>
    <BListGroupItem :color="{ theme: 'info' }">Info list group item</BListGroupItem>
    <BListGroupItem :color="{ theme: 'accent' }">Accent list group item</BListGroupItem>
    <BListGroupItem :color="{ theme: 'inverse' }">Inverse list group item</BListGroupItem>
  </BListGroup>
  <!-- #endregion template -->
</template>
