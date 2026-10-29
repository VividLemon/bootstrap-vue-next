<template>
  <!-- #region template -->
  <!-- Using props -->
  <BInputGroup size="lg" prepend="$" append=".00">
    <BFormInput />
  </BInputGroup>
  <!-- Using slots -->
  <BInputGroup class="mt-3">
    <template #append>
      <BInputGroupText><strong class="fg-danger">!</strong></BInputGroupText>
    </template>
    <BFormInput />
  </BInputGroup>
  <!-- Using components -->
  <BInputGroup prepend="Username" class="mt-3">
    <BFormInput />
    <BButton variant="outline" theme="success">Button</BButton>
    <BButton theme="info">Button</BButton>
  </BInputGroup>
  <!-- #endregion template -->
</template>
