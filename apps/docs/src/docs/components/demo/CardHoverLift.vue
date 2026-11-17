<template>
  <!-- #region template -->
  <BRow :gutter-y="{ xs: 7 }">
    <BCol :cols="{ xs: 12, md: 6 }">
      <BCard hover-lift title="Hover me">
        <BCardText>This card lifts on hover.</BCardText>
      </BCard>
    </BCol>
    <BCol :cols="{ xs: 12, md: 6 }">
      <BCard
        hover-lift
        tag="a"
        href="#card-hover-lift"
        title="Linked card"
        class="text-decoration-none"
        style="--bs-hover-lift-transform: translateY(-0.5rem)"
      >
        <BCardText>A focusable card also lifts on keyboard focus.</BCardText>
      </BCard>
    </BCol>
  </BRow>
  <!-- #endregion template -->
</template>
