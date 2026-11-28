<template>
  <!-- #region template -->
  <div>
    <BButtonToolbar aria-label="Toolbar with size sm">
      <BButtonGroup size="sm">
        <BButton>New</BButton>
        <BButton>Edit</BButton>
        <BButton>Undo</BButton>
      </BButtonGroup>
    </BButtonToolbar>
  </div>
  <div class="mt-2">
    <BButtonToolbar aria-label="Toolbar with menu size sm">
      <BMenu size="sm" placement="end" text="menu">
        <BMenuItem>Item 1</BMenuItem>
        <BMenuItem>Item 2</BMenuItem>
        <BMenuItem>Item 3</BMenuItem>
      </BMenu>
    </BButtonToolbar>
  </div>
  <div class="mt-2">
    <BButtonToolbar aria-label="Toolbar with size lg">
      <BButtonGroup size="lg">
        <BButton>New</BButton>
        <BButton>Edit</BButton>
        <BButton>Undo</BButton>
      </BButtonGroup>
    </BButtonToolbar>
  </div>
  <div class="mt-2">
    <BButtonToolbar aria-label="Toolbar with menu size lg">
      <BMenu size="lg" placement="end" text="menu">
        <BMenuItem>Item 1</BMenuItem>
        <BMenuItem>Item 2</BMenuItem>
        <BMenuItem>Item 3</BMenuItem>
      </BMenu>
    </BButtonToolbar>
  </div>
  <!-- #endregion template -->
</template>
