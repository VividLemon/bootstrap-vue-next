<template>
  <!-- #region template -->
  <BNavbar v-b-color-mode="'dark'" :color="{ theme: 'inverse' }">
    <BNavbarNav>
      <BNavItem href="#navbar-item-dropdown">Home</BNavItem>
      <BNavItemDropdown text="Lang" placement="bottom-end">
        <BMenuItem>EN</BMenuItem>
        <BMenuItem>ES</BMenuItem>
        <BMenuItem>RU</BMenuItem>
        <BMenuItem>FA</BMenuItem>
      </BNavItemDropdown>
      <BNavItemDropdown text="User" placement="bottom-end">
        <BMenuItem>Account</BMenuItem>
        <BMenuItem>Settings</BMenuItem>
      </BNavItemDropdown>
    </BNavbarNav>
  </BNavbar>
  <!-- #endregion template -->
</template>
