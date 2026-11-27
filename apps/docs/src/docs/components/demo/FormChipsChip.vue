<template>
  <!-- #region template -->
  <div class="d-flex flex-wrap gap-2">
    <BChip>Default</BChip>
    <BChip active>Active</BChip>
    <BChip :color="{ theme: 'success' }">Success</BChip>
    <BChip>
      <template #icon>
        <StarIcon />
      </template>
      With icon
    </BChip>
    <BChip dismissible value="Dismissible" dismiss-label="Remove Dismissible" />
    <BChip disabled>Disabled</BChip>
  </div>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import StarIcon from '~icons/bi/star-fill'
</script>
