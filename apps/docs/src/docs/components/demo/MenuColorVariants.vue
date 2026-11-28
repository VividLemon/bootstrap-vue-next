<template>
  <!-- #region template -->
  <div class="d-flex flex-wrap gap-2">
    <BMenu text="Primary" :color="{ theme: 'primary' }">
      <BMenuItem>Action</BMenuItem>
    </BMenu>
    <BMenu text="Success outline" variant="outline" :color="{ theme: 'success' }">
      <BMenuItem>Action</BMenuItem>
    </BMenu>
    <BMenu text="Danger subtle" variant="subtle" :color="{ theme: 'danger' }">
      <BMenuItem>Action</BMenuItem>
    </BMenu>
    <BMenu text="Link" variant="link">
      <BMenuItem>Action</BMenuItem>
    </BMenu>
  </div>
  <!-- #endregion template -->
</template>
