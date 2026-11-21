<template>
  <!-- #region template -->
  <div class="d-flex gap-2">
    <BTooltip>
      <template #activator="{ props }">
        <BButton v-bind="props">Hover Me</BButton>
      </template>
      I am tooltip <b>component</b> content!
    </BTooltip>

    <BButton v-b-tooltip.focus.top="'I am tooltip directive content!'"> Hover Me </BButton>
  </div>
  <!-- #endregion template -->
</template>
