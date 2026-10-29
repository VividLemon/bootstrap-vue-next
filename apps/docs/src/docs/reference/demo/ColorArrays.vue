<template>
  <!-- #region template -->
  <BRow class="g-2">
    <BCol cols="12">
      Theme with modifiers:
      <BBadge :theme="['primary', 'contrast']">contrast</BBadge>
      <BBadge :theme="['danger', 'subtle', 'border']">subtle + border</BBadge>
      <BBadge :theme="['success', 'muted']">muted</BBadge>
    </BCol>
    <BCol cols="12">
      Background with opacity:
      <BBadge :bg="['success', 90]" fg="contrast-success">bg 90%</BBadge>
      <BBadge :bg="['subtle-success', 40]" fg="success">bg 40%</BBadge>
    </BCol>
    <BCol cols="12">
      Foreground with opacity:
      <BBadge bg="body" :fg="['primary', 50]">fg 50%</BBadge>
    </BCol>
  </BRow>
  <!-- #endregion template -->
</template>
