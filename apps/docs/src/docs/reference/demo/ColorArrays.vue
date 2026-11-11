<template>
  <!-- #region template -->
  <BRow class="g-2">
    <BCol :cols="{ xs: 12 }">
      Theme with modifiers:
      <BBadge :color="{ theme: ['primary', 'contrast'] }">contrast</BBadge>
      <BBadge :color="{ theme: ['danger', 'subtle', 'border'] }">subtle + border</BBadge>
      <BBadge :color="{ theme: ['success', 'muted'] }">muted</BBadge>
    </BCol>
    <BCol :cols="{ xs: 12 }">
      Background with opacity:
      <BBadge :color="{ bg: ['success', 90], fg: 'contrast-success' }">bg 90%</BBadge>
      <BBadge :color="{ bg: ['subtle-success', 40], fg: 'success' }">bg 40%</BBadge>
    </BCol>
    <BCol :cols="{ xs: 12 }">
      Foreground with opacity:
      <BBadge :color="{ bg: 'body', fg: ['primary', 50] }">fg 50%</BBadge>
    </BCol>
  </BRow>
  <!-- #endregion template -->
</template>
