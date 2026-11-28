<template>
  <!-- #region template -->
  <BInputGroup>
    <template #prepend>
      <BMenu text="Menu" :color="{ theme: 'info' }">
        <BMenuItem>Action A</BMenuItem>
        <BMenuItem>Action B</BMenuItem>
      </BMenu>
    </template>
    <BFormInput />
    <template #append>
      <BMenu v-for="i in 2" :key="i" text="Menu" variant="outline" :color="{ theme: 'secondary' }">
        <BMenuItem>Action C</BMenuItem>
        <BMenuItem>Action D</BMenuItem>
      </BMenu>
    </template>
  </BInputGroup>
  <!-- #endregion template -->
</template>
