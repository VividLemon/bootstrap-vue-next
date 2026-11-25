<template>
  <!-- #region template -->
  <BMenu>
    <template #activator="{ props }">
      <BBadge tag="button" type="button" :color="{ theme: 'info' }" v-bind="props">
        Custom opener
      </BBadge>
    </template>
    <BMenuItem>Action</BMenuItem>
    <BMenuItem>Another action</BMenuItem>
    <BMenuItem>Something else here</BMenuItem>
  </BMenu>
  <!-- #endregion template -->
</template>
