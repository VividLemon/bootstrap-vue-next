<template>
  <div id="menu-page">
    <BMenu
      id="ssr-menu"
      text="Menu"
    >
      <BMenuHeader>Header</BMenuHeader>
      <BMenuItem>Item 1</BMenuItem>
      <BMenuItem to="/">
        Item 2
      </BMenuItem>
      <BMenuDivider />
      <BMenuText>Text</BMenuText>
    </BMenu>
    <BMenu
      id="ssr-menu-open"
      text="Open menu"
      split
      :model-value="true"
    >
      <BMenuItem>Item</BMenuItem>
    </BMenu>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'MenuPage' })
</script>
