<template>
  <!-- #region template -->
  <BAvatarGroup size="lg">
    <template #default="{ count }">
      <BAvatar variant="primary">BV</BAvatar>
      <BAvatar img="https://picsum.photos/300/300" img-alt="Random photo" />
      <BAvatar variant="danger">OK</BAvatar>
      <BAvatar subtle>{{ count }}</BAvatar>
    </template>
  </BAvatarGroup>
  <!-- #endregion template -->
</template>
