<template>
  <!-- #region template -->
  <BFormGroup
    :label-cols="{ xs: 4, lg: 2 }"
    label-size="sm"
    label="Small"
    label-for="input-sm"
    class="my-1"
  >
    <BFormInput
      id="input-sm"
      size="sm"
    />
  </BFormGroup>
  <BFormGroup
    :label-cols="{ xs: 4, lg: 2 }"
    label="Default"
    label-for="input-default"
    class="my-1"
  >
    <BFormInput id="input-default" />
  </BFormGroup>
  <BFormGroup
    :label-cols="{ xs: 4, lg: 2 }"
    label-size="lg"
    label="Large"
    label-for="input-lg"
    class="my-1"
  >
    <BFormInput
      id="input-lg"
      size="lg"
    />
  </BFormGroup>
  <!-- #endregion template -->
</template>
