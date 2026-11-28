<template>
  <!-- #region template -->
  <BNavbar v-b-color-mode="'dark'" toggleable="lg" :color="{ theme: 'primary' }">
    <BNavbarBrand href="#navbar-overview">NavBar</BNavbarBrand>
    <BNavbarToggle target="nav-collapse" />
    <BCollapse id="nav-collapse" is-nav>
      <BNavbarNav>
        <BNavItem href="#navbar-overview">Link</BNavItem>
        <BNavItem href="#navbar-overview" disabled>Disabled</BNavItem>
      </BNavbarNav>
      <!-- Right aligned nav items -->
      <BNavbarNav class="ms-auto mb-2 mb-lg-0">
        <BNavItemDropdown text="Lang" placement="bottom-end">
          <BMenuItem>EN</BMenuItem>
          <BMenuItem>ES</BMenuItem>
          <BMenuItem>RU</BMenuItem>
          <BMenuItem>FA</BMenuItem>
        </BNavItemDropdown>
        <BNavItemDropdown placement="bottom-end">
          <!-- Using the 'toggle' slot -->
          <template #toggle>
            <em>User</em>
          </template>
          <BMenuItem>Profile</BMenuItem>
          <BMenuItem>Sign Out</BMenuItem>
        </BNavItemDropdown>
      </BNavbarNav>
      <BNavForm class="d-flex">
        <BFormInput class="me-2" placeholder="Search" />
        <BButton type="submit" variant="outline" :color="{ theme: 'success' }">Search</BButton>
      </BNavForm>
    </BCollapse>
  </BNavbar>
  <!-- #endregion template -->
</template>
