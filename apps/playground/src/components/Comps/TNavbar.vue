<template>
  <div>
    <BNavbar toggleable="lg" :color="{ theme: 'info' }">
      <BNavbarBrand href="#">NavBar</BNavbarBrand>

      <BNavbarToggle target="nav-collapse" />

      <BCollapse id="nav-collapse" is-nav>
        <BNavbarNav>
          <BNavItem href="#">Link</BNavItem>
          <BNavItem href="#" disabled>Disabled</BNavItem>
        </BNavbarNav>

        <!-- Right aligned nav items -->
        <BNavbarNav class="ms-auto">
          <BNavForm>
            <BFormInput
              size="sm"
              class="me-sm-2"
              placeholder="Search"
            />
            <BButton size="sm" class="my-2 my-sm-0" type="submit"
              >Search</BButton
            >
          </BNavForm>

          <BNavItemDropdown text="Lang" placement="bottom-end">
            <BMenuItem href="#">EN</BMenuItem>
            <BMenuItem href="#">ES</BMenuItem>
            <BMenuItem href="#">RU</BMenuItem>
            <BMenuItem href="#">FA</BMenuItem>
          </BNavItemDropdown>

          <BNavItemDropdown placement="bottom-end">
            <!-- Using the 'toggle' slot -->
            <template #toggle>
              <em>User</em>
            </template>
            <BMenuItem href="#">Profile</BMenuItem>
            <BMenuItem href="#">Sign Out</BMenuItem>
          </BNavItemDropdown>
        </BNavbarNav>
      </BCollapse>
    </BNavbar>
  </div>
</template>
