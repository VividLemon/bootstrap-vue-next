<template>
  <!-- #region template -->
  <BNavbar
    data-bs-theme="dark"
    toggleable="sm"
    :color="{theme: 'primary'}"
  >
    <BNavbarToggle target="nav-text-collapse" />
    <BNavbarBrand>BootstrapVue</BNavbarBrand>
    <BCollapse
      id="nav-text-collapse"
      is-nav
    >
      <BNavbarNav>
        <BNavText>Navbar text</BNavText>
      </BNavbarNav>
    </BCollapse>
  </BNavbar>
  <!-- #endregion template -->
</template>
