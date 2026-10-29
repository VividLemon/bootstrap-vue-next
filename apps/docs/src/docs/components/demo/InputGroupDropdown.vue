<template>
  <!-- #region template -->
  <BInputGroup>
    <template #prepend>
      <BDropdown text="Dropdown" theme="info">
        <BDropdownItem>Action A</BDropdownItem>
        <BDropdownItem>Action B</BDropdownItem>
      </BDropdown>
    </template>
    <BFormInput />
    <template #append>
      <BDropdown v-for="i in 2" :key="i" text="Dropdown" variant="outline" theme="secondary">
        <BDropdownItem>Action C</BDropdownItem>
        <BDropdownItem>Action D</BDropdownItem>
      </BDropdown>
    </template>
  </BInputGroup>
  <!-- #endregion template -->
</template>
