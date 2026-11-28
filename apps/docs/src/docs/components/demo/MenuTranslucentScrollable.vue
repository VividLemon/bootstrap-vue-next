<template>
  <!-- #region template -->
  <div class="d-flex flex-wrap gap-2">
    <BMenu text="Translucent" translucent>
      <BMenuItem>Action</BMenuItem>
      <BMenuItem>Another action</BMenuItem>
      <BMenuItem>Something else here</BMenuItem>
    </BMenu>
    <BMenu text="Scrollable" scrollable>
      <BMenuItem v-for="n in 50" :key="n">Item {{ n }}</BMenuItem>
    </BMenu>
  </div>
  <!-- #endregion template -->
</template>
