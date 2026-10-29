<template>
  <!-- #region template -->
  <BInputGroup prepend="Item">
    <BInputGroupText>
      <input type="checkbox" aria-label="Checkbox for following text input" />
    </BInputGroupText>
    <BInputGroupText><b>$</b></BInputGroupText>
    <BFormInput type="number" aria-label="Text input with checkbox" />
  </BInputGroup>
  <BInputGroup class="mt-2">
    <BButton variant="outline" theme="info">Button</BButton>
    <BFormInput type="number" min="0.00" />
    <BButton variant="outline" theme="secondary">Button</BButton>
    <BButton variant="outline" theme="primary">Button</BButton>
  </BInputGroup>
  <!-- #endregion template -->
</template>
