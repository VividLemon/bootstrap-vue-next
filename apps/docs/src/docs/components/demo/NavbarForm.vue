<template>
  <!-- #region template -->
  <BNavbar v-b-color-mode="'dark'" :color="{ theme: 'primary' }">
    <BNavForm>
      <BFormInput class="me-sm-2" placeholder="Search" />
      <BButton variant="outline" :color="{ theme: 'success' }" class="my-2 my-sm-0" type="submit"
        >Search</BButton
      >
    </BNavForm>
  </BNavbar>
  <!-- #endregion template -->
</template>
