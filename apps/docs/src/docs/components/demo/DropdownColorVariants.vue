<template>
  <div class="d-flex flex-wrap gap-2">
    <!-- #region template -->
    <BDropdown text="Primary" :color="{ theme: 'primary' }" class="me-2">
      <BDropdownItem>Action</BDropdownItem>
      <BDropdownItem>Another action</BDropdownItem>
      <BDropdownItem>Something else here</BDropdownItem>
    </BDropdown>
    <BDropdown text="Success" :color="{ theme: 'success' }" class="me-2">
      <BDropdownItem>Action</BDropdownItem>
      <BDropdownItem>Another action</BDropdownItem>
      <BDropdownItem>Something else here</BDropdownItem>
    </BDropdown>
    <BDropdown text="Outline Danger" variant="outline" :color="{ theme: 'danger' }" class="me-2">
      <BDropdownItem>Action</BDropdownItem>
      <BDropdownItem>Another action</BDropdownItem>
      <BDropdownItem>Something else here</BDropdownItem>
    </BDropdown>
    <!-- #endregion template -->
  </div>
</template>
