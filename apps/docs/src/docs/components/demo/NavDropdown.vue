<template>
  <!-- #region template -->
  <BNav pills>
    <BNavItem active href="#nav-dropdown">Active</BNavItem>
    <BNavItem href="#nav-dropdown">Link</BNavItem>
    <BNavItemDropdown
      id="my-nav-menu"
      text="Menu"
      :toggle-attrs="{ class: 'nav-link-custom' }"
      placement="bottom-end"
    >
      <BMenuItem>One</BMenuItem>
      <BMenuItem>Two</BMenuItem>
      <BMenuDivider />
      <BMenuItem>Three</BMenuItem>
    </BNavItemDropdown>
  </BNav>
  <!-- #endregion template -->
</template>
