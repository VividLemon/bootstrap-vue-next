<template>
  <!-- #region template -->
  <BButtonGroup aria-label="Button group with menu">
    <BButton :color="{ theme: 'secondary' }">Button</BButton>
    <BMenu text="Menu" :color="{ theme: 'secondary' }">
      <BMenuItem>Action</BMenuItem>
      <BMenuItem>Another action</BMenuItem>
      <BMenuItem>Something else here</BMenuItem>
      <BMenuDivider />
      <BMenuItem>Separated link</BMenuItem>
    </BMenu>
  </BButtonGroup>
  <!-- #endregion template -->
</template>
