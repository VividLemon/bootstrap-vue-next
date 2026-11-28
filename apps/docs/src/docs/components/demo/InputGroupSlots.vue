<template>
  <!-- #region template -->
  <BInputGroup>
    <template #prepend>
      <BInputGroupText>Username</BInputGroupText>
    </template>
    <BFormInput />
    <template #append>
      <BMenu text="Menu" :color="{ theme: 'success' }">
        <BMenuItem>Action A</BMenuItem>
        <BMenuItem>Action B</BMenuItem>
      </BMenu>
    </template>
  </BInputGroup>
  <!-- #endregion template -->
</template>
