<template>
  <!-- #region template -->
  <BDropdown text="Block Level Dropdown" theme="primary" class="d-grid gap-2 mb-2">
    <BDropdownItem>Action</BDropdownItem>
    <BDropdownItem>Another action</BDropdownItem>
    <BDropdownItem>Something else here</BDropdownItem>
  </BDropdown>
  <div class="d-grid gap-2">
    <BDropdown
      text="Block Level Split Dropdown"
      split
      split-variant="outline"
      split-theme="primary"
      theme="primary"
      split-class="w-100"
    >
      <BDropdownItem>Action</BDropdownItem>
      <BDropdownItem>Another action</BDropdownItem>
      <BDropdownItem>Something else here...</BDropdownItem>
    </BDropdown>
  </div>
  <!-- #endregion template -->
</template>
