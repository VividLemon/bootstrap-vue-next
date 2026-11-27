<template>
  <!-- #region template -->
  <BInputGroup prepend="$" append=".00">
    <BFormInput />
  </BInputGroup>
  <BInputGroup prepend="0" append="100" class="mt-3">
    <div class="form-control d-flex align-items-center">
      <BFormRange aria-label="Percentage" class="w-100" />
    </div>
  </BInputGroup>
  <!-- #endregion template -->
</template>
