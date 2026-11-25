<template>
  <!-- #region template -->
  <BMenu text="Sign in" auto-close="outside">
    <BForm class="px-3 py-2 d-flex flex-column gap-2">
      <BFormGroup label="Email address" label-for="menu-email">
        <BFormInput id="menu-email" type="email" placeholder="email@example.com" />
      </BFormGroup>
      <BFormGroup label="Password" label-for="menu-password">
        <BFormInput id="menu-password" type="password" />
      </BFormGroup>
      <BButton type="submit" :color="{ theme: 'primary' }">Sign in</BButton>
    </BForm>
    <BMenuDivider />
    <BMenuItem>New around here? Sign up</BMenuItem>
  </BMenu>
  <!-- #endregion template -->
</template>
