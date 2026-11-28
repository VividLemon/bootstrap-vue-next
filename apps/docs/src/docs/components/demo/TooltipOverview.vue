<template>
  <!-- #region template -->
  <div class="d-flex gap-2">
    <BTooltip>
      <template #activator="{props}">
        <BButton v-bind="props">Hover Me</BButton>
      </template>
      I am tooltip <b>component</b> content!
    </BTooltip>

    <BTooltip
      focus
      placement="top"
      title="I only open on focus!"
    >
      <template #activator="{props}">
        <BButton v-bind="props">Focus Me</BButton>
      </template>
    </BTooltip>
  </div>
  <!-- #endregion template -->
</template>
