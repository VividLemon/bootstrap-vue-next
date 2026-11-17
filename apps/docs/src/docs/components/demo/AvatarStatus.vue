<template>
  <!-- #region template -->
  <div class="d-flex gap-3">
    <BAvatar src="https://picsum.photos/80/80/?image=64" alt="Ann" status="online" />
    <BAvatar text="BO" status="offline" />
    <BAvatar text="CB" :color="{ theme: 'primary' }" status="busy" />
    <BAvatar text="DA" size="lg" status="away" status-label="Away since 10:00" />
  </div>
  <!-- #endregion template -->
</template>
