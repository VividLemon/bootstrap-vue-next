<template>
  <!-- #region template -->
  <BMenu text="Items">
    <BMenuItem>Button item</BMenuItem>
    <BMenuItem href="#">Link item</BMenuItem>
    <BMenuItem active>Active item</BMenuItem>
    <BMenuItem disabled>Disabled item</BMenuItem>
    <BMenuItem :color="{ theme: 'danger' }">Delete</BMenuItem>
  </BMenu>
  <!-- #endregion template -->
</template>
