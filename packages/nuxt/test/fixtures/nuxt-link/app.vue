<template>
  <div>
    <BLink
      id="direct-link"
      to="/direct"
    >
      Direct
    </BLink>

    <BButton
      id="button-link"
      to="/button"
    >
      Button
    </BButton>

    <BNavItem
      to="/nav-item"
      :link-attrs="{ id: 'nav-item-link' }"
    >
      NavItem
    </BNavItem>

    <BMenuItem
      id="menu-item-link"
      to="/menu-item"
    >
      MenuItem
    </BMenuItem>
  </div>
</template>
