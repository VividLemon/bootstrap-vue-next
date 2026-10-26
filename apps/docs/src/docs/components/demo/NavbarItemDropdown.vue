<template>
  <!-- #region template -->
  <BNavbar v-b-color-mode="'dark'" theme="inverse">
    <BNavbarNav>
      <BNavItem href="#navbar-item-dropdown">Home</BNavItem>
      <BNavItemDropdown text="Lang" right>
        <BDropdownItem>EN</BDropdownItem>
        <BDropdownItem>ES</BDropdownItem>
        <BDropdownItem>RU</BDropdownItem>
        <BDropdownItem>FA</BDropdownItem>
      </BNavItemDropdown>
      <BNavItemDropdown text="User" right>
        <BDropdownItem>Account</BDropdownItem>
        <BDropdownItem>Settings</BDropdownItem>
      </BNavItemDropdown>
    </BNavbarNav>
  </BNavbar>
  <!-- #endregion template -->
</template>
