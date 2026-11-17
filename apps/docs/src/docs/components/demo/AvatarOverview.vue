<template>
  <!-- #region template -->
  <p>Using stand-alone:</p>
  <div class="d-flex gap-2 mb-4">
    <BAvatar text="JC" />
    <BAvatar :color="{ theme: 'primary' }" text="BV" />
    <BAvatar src="https://picsum.photos/300/300" alt="Super Kitty" />
    <BAvatar :color="{ theme: 'success' }" variant="subtle" text="AG" status="online" />
  </div>
  <p>Using in components (list group) example:</p>
  <BListGroup style="max-width: 300px">
    <BListGroupItem class="d-flex align-items-center gap-3">
      <BAvatar text="JC" />
      <span class="me-auto">J. Circlehead</span>
      <BBadge>5</BBadge>
    </BListGroupItem>
    <BListGroupItem class="d-flex align-items-center gap-3">
      <BAvatar :color="{ theme: 'primary' }" text="BV" />
      <span class="me-auto">BootstrapVueNext</span>
      <BBadge>12</BBadge>
    </BListGroupItem>
    <BListGroupItem class="d-flex align-items-center gap-3">
      <BAvatar src="https://picsum.photos/300/300" alt="Super Kitty" />
      <span class="me-auto">Super Kitty</span>
      <BBadge>9</BBadge>
    </BListGroupItem>
  </BListGroup>
  <!-- #endregion template -->
</template>
