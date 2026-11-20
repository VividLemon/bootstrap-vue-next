<template>
  <!-- #region template -->
  <BButtonToolbar aria-label="Toolbar with button groups and input groups">
    <BButtonGroup size="sm">
      <BButton>Save</BButton>
      <BButton>Cancel</BButton>
    </BButtonGroup>
    <BInputGroup size="sm" prepend="$" append=".00">
      <BFormInput value="100" class="text-end" />
    </BInputGroup>
  </BButtonToolbar>
  <!-- #endregion template -->
</template>
