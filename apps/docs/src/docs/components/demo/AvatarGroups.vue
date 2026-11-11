<template>
  <!-- #region template -->
  <BAvatarGroup size="60px">
    <BAvatar />
    <BAvatar text="BV" :color="{ theme: 'primary' }" />
    <BAvatar src="https://picsum.photos/300/300" :color="{ theme: 'info' }" />
    <BAvatar text="OK" :color="{ theme: 'danger' }" />
    <BAvatar :color="{ theme: 'warning' }" />
    <BAvatar src="https://picsum.photos/320/320" :color="{ theme: 'inverse' }" />
    <BAvatar :color="{ theme: 'success' }" />
  </BAvatarGroup>
  <!-- #endregion template -->
</template>
