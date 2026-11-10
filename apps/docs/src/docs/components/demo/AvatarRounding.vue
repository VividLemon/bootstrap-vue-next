<template>
  <!-- #region template -->
  <div class="d-flex" style="column-gap: 1%">
    <BAvatar rounded="sm" />
    <BAvatar rounded />
    <BAvatar rounded="lg" />
    <BAvatar :rounded-sides="{ bottom: 'sm' }" />
    <BAvatar :rounded-sides="{ start: 'md' }" />
    <BAvatar :rounded-sides="{ top: 'lg' }" />
    <BAvatar :rounded-sides="{ end: 'md' }" />
    <BAvatar rounded="circle" />
    <BAvatar rounded="circle" :rounded-sides="{ top: '0' }" />
    <BAvatar rounded="0" />
  </div>
  <!-- #endregion template -->
</template>
