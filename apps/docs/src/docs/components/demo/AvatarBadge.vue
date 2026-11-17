<template>
  <!-- #region template -->
  <span class="position-relative d-inline-flex">
    <BAvatar text="BV" :color="{ theme: 'primary' }" />
    <BBadge placement="top-end" pill :color="{ theme: 'danger' }">
      3
      <span class="visually-hidden">unread messages</span>
    </BBadge>
  </span>
  <!-- #endregion template -->
</template>
