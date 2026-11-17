<template>
  <!-- #region template -->
  <BCard>
    <BFormField :state="false" class="mb-2">
      <BFormInput />
    </BFormField>
    <BFormField :state="false">
      <!-- Use the state prop to override this behavior -->
      <BFormInput :state="null" />
    </BFormField>
  </BCard>
  <!-- #endregion template -->
</template>
