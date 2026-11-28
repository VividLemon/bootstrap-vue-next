<template>
  <!-- #region template -->
  <BNavbar v-b-color-mode="'dark'" :toggleable="true" :color="{ theme: 'primary' }">
    <BNavbarBrand href="#navbar-offcanvas">NavBar</BNavbarBrand>
    <BNavbarToggle target="nav-offcanvas" />
    <BOffcanvas id="nav-offcanvas" title="Offcanvas" placement="end" is-nav>
      <BNavbarNav>
        <BNavItem href="#navbar-offcanvas">Link</BNavItem>
        <BNavItem href="#navbar-offcanvas" disabled>Disabled</BNavItem>
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
    </BOffcanvas>
  </BNavbar>
  <!-- #endregion template -->
</template>
