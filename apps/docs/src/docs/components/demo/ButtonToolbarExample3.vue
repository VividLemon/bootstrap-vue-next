<template>
  <!-- #region template -->
  <BButtonToolbar aria-label="Toolbar with button groups and dropdown menu">
    <BButtonGroup>
      <BButton>New</BButton>
      <BButton>Edit</BButton>
      <BButton>Undo</BButton>
    </BButtonGroup>
    <BDropdown placement="right" text="menu">
      <BDropdownItem>Item 1</BDropdownItem>
      <BDropdownItem>Item 2</BDropdownItem>
      <BDropdownItem>Item 3</BDropdownItem>
    </BDropdown>
    <BButtonGroup>
      <BButton>Save</BButton>
      <BButton>Cancel</BButton>
    </BButtonGroup>
  </BButtonToolbar>
  <!-- #endregion template -->
</template>
