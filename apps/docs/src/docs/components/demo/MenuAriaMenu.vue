<template>
  <!-- #region template -->
  <BMenu text="Actions" :menu-attrs="{ role: 'menu', 'aria-label': 'Actions' }">
    <BMenuItem role="menuitem">Copy</BMenuItem>
    <BMenuItem role="menuitem">Paste</BMenuItem>
    <BMenuDivider role="separator" />
    <BMenuItem role="menuitem">Delete</BMenuItem>
  </BMenu>
  <!-- #endregion template -->
</template>
