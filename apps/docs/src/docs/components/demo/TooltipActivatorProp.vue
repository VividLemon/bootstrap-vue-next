<template>
  <div class="d-flex gap-2">
    <BButton id="tooltip-activator-by-id">Hover Me</BButton>
    <BTooltip activator="tooltip-activator-by-id">
      This tooltip's activator is given by its element ID
    </BTooltip>
  </div>
</template>
