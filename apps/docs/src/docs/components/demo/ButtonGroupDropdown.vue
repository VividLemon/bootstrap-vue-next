<template>
  <!-- #region template -->
  <BButtonGroup aria-label="Button group with dropdown">
    <BButton :color="{ theme: 'secondary' }">Button</BButton>
    <BDropdown text="Dropdown" :color="{ theme: 'secondary' }">
      <BDropdownItem>Action</BDropdownItem>
      <BDropdownItem>Another action</BDropdownItem>
      <BDropdownItem>Something else here</BDropdownItem>
      <BDropdownDivider />
      <BDropdownItem>Separated link</BDropdownItem>
    </BDropdown>
  </BButtonGroup>
  <!-- #endregion template -->
</template>
