<template>
  <!-- #region template -->
  <div class="d-flex" style="column-gap: 1%">
    <BAvatar badge />
    <BAvatar badge :badge-color="{ theme: 'danger' }" src="https://picsum.photos/30/30/?image=40" />
    <BAvatar badge :badge-color="{ theme: 'warning' }" />
    <BAvatar
      badge
      :badge-color="{ theme: 'success' }"
      src="https://picsum.photos/30/30/?image=40"
    />
    <BAvatar badge :badge-color="{ theme: 'inverse' }" text="BV" />
    <BAvatar square badge :badge-color="{ theme: 'inverse' }" text="BV" />
  </div>
  <!-- #endregion template -->
</template>
