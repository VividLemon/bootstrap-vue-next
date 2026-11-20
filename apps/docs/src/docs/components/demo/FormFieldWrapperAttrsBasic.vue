<template>
  <!-- #region template -->
  <BFormField
    label="My Label:"
    label-for="my-input"
    :label-cols="{ md: 3 }"
    :label-wrapper-attrs="{
      class: 'custom-label-width',
      style: 'flex: 0 0 120px; max-width: 120px;',
    }"
  >
    <BFormInput id="my-input" />
  </BFormField>
  <!-- #endregion template -->
</template>
