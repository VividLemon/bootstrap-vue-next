<template>
  <BContainer fluid>
    <BRow>
      <BCol>
        <h4 class="my-3">Nav with a menu</h4>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <BNav pills>
          <BNavItem active>Active</BNavItem>
          <BNavItem>Link</BNavItem>
          <BNavItemDropdown
            id="my-nav-menu"
            text="Menu"
            :toggle-attrs="{class: 'nav-link-custom'}"
            placement="bottom-end"
            @shown="consoleLog('shown')"
          >
            <BMenuItem>One</BMenuItem>
            <BMenuItem>Two</BMenuItem>
            <BMenuDivider />
            <BMenuItem>Three</BMenuItem>
          </BNavItemDropdown>
        </BNav>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <h4 class="m-2">Nav with a menu and a custom Button Icon</h4>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <BNav pills>
          <BNavItem active>Active</BNavItem>
          <BNavItem>Link</BNavItem>
          <BNavItemDropdown text="Custom Button Icon">
            <template #toggle>
              <img src="../../assets/logo.png" style="height: 1em" />
            </template>
            <BMenuItem href="#">Action</BMenuItem>
          </BNavItemDropdown>
        </BNav>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script setup lang="ts">
const consoleLog = (...args: unknown[]) => console.log(...args)
</script>
