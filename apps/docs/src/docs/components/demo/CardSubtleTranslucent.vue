<template>
  <!-- #region template -->
  <div class="d-flex flex-wrap gap-3">
    <BCard
      subtle
      :color="{ theme: 'primary' }"
      header="Subtle"
      footer="Footer"
      style="max-width: 18rem"
    >
      <BCardText>The theme tints the borders, the header and the footer.</BCardText>
    </BCard>
    <div class="p-3 rounded bg-subtle-primary">
      <BCard translucent header="Translucent" style="max-width: 18rem">
        <BCardText>The card lets the background behind it show through, blurred.</BCardText>
      </BCard>
    </div>
  </div>
  <!-- #endregion template -->
</template>
