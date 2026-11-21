<template>
  <!-- #region template -->
  <div class="d-flex gap-2">
    <BTooltip
      placement="top"
      body="Default Trigger"
    >
      <template #activator="{ props }">
        <BButton v-bind="props"> Default Trigger </BButton>
      </template>
    </BTooltip>
    <BTooltip
      click
      placement="top"
      body="Click Trigger"
    >
      <template #activator="{ props }">
        <BButton v-bind="props"> Click Trigger </BButton>
      </template>
    </BTooltip>
  </div>
  <!-- #endregion template -->
</template>
