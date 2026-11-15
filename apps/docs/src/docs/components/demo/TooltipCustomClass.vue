<template>
  <!-- #region template -->
  <div class="d-flex gap-2">
    <BTooltip :body-attrs="{ class: 'my-tooltip-body-class' }">
      <template #target>
        <BButton href="#tooltip-custom-class" tabindex="0">Button</BButton>
      </template>
      My tooltip
    </BTooltip>
    <BTooltip title="My tooltip" :title-attrs="{ class: 'my-tooltip-title-class' }">
      <template #target>
        <BButton href="#tooltip-custom-class" tabindex="1">Button</BButton>
      </template>
    </BTooltip>
  </div>
  <!-- #endregion template -->
</template>
