<template>
  <!-- #region template -->
  <BMenu text="Plans">
    <BMenuItem description="For personal projects">Free</BMenuItem>
    <BMenuItem description="For growing teams">Pro</BMenuItem>
    <BMenuItem>
      Enterprise
      <template #description>Talk to <strong>sales</strong></template>
    </BMenuItem>
  </BMenu>
  <!-- #endregion template -->
</template>
