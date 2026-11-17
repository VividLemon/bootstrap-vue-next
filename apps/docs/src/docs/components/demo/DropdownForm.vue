<template>
  <!-- #region template -->
  <BDropdown text="Dropdown with form" auto-close="outside">
    <BDropdownForm>
      <BFormField
        label="Email address:"
        label-for="email"
        description="We'll never share your email with anyone else."
      >
        <BFormInput id="email" type="email" placeholder="Enter email" required />
      </BFormField>
      <BFormField
        label="Password:"
        label-for="password"
        description="We'll never share your email with anyone else."
      >
        <BFormInput id="password" type="password" required />
      </BFormField>
      <BFormCheckbox id="remember" name="remember" value="remember" checked>
        Remember me</BFormCheckbox
      >
      <BButton type="submit" :color="{ theme: 'primary' }">Sign In</BButton>
    </BDropdownForm>
    <BDropdownDivider />
    <BDropdownItemButton>New around here? Sign up</BDropdownItemButton>
    <BDropdownItemButton>Forget Password</BDropdownItemButton>
  </BDropdown>
  <!-- #endregion template -->
</template>
