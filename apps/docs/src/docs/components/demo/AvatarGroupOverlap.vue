<template>
  <!-- #region template -->
  <div class="d-flex flex-column gap-3">
    <BAvatarGroup :overlap="0" aria-label="No overlap">
      <BAvatar text="A" />
      <BAvatar text="B" />
      <BAvatar text="C" />
    </BAvatarGroup>
    <BAvatarGroup :overlap="0.65" aria-label="Large overlap">
      <BAvatar text="A" />
      <BAvatar text="B" />
      <BAvatar text="C" />
    </BAvatarGroup>
  </div>
  <!-- #endregion template -->
</template>
