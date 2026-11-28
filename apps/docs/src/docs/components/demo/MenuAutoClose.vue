<template>
  <!-- #region template -->
  <div class="d-flex flex-wrap gap-2">
    <BMenu text="Default">
      <BMenuItem>Action</BMenuItem>
      <BMenuItem>Another action</BMenuItem>
      <BMenuItem>Something else here</BMenuItem>
    </BMenu>
    <BMenu text="Clickable inside" auto-close="outside">
      <BMenuItem>Action</BMenuItem>
      <BMenuItem>Another action</BMenuItem>
      <BMenuItem>Something else here</BMenuItem>
    </BMenu>
    <BMenu text="Clickable outside" auto-close="inside">
      <BMenuItem>Action</BMenuItem>
      <BMenuItem>Another action</BMenuItem>
      <BMenuItem>Something else here</BMenuItem>
    </BMenu>
    <BMenu text="Manual close" :auto-close="false">
      <BMenuItem>Action</BMenuItem>
      <BMenuItem>Another action</BMenuItem>
      <BMenuItem>Something else here</BMenuItem>
    </BMenu>
  </div>
  <!-- #endregion template -->
</template>
