<template>
  <!-- #region template -->
  <BButton :color="{ theme: 'primary' }" class="position-relative">
    Inbox
    <BBadge
      dot-indicator
      :color="{ theme: 'danger' }"
      class="position-absolute top-0 start-100 translate-middle"
    />
  </BButton>
  <!-- #endregion template -->
</template>
