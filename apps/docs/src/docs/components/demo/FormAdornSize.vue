<template>
  <!-- #region template -->
  <BFormAdorn size="sm" class="mb-2">
    <template #start>
      <SearchIcon />
    </template>
    <BFormInput placeholder="Small input" aria-label="Small input" />
  </BFormAdorn>
  <BFormAdorn class="mb-2">
    <template #start>
      <SearchIcon />
    </template>
    <BFormInput placeholder="Default input" aria-label="Default input" />
  </BFormAdorn>
  <BFormAdorn size="lg">
    <template #start>
      <SearchIcon />
    </template>
    <BFormInput placeholder="Large input" aria-label="Large input" />
  </BFormAdorn>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import SearchIcon from '~icons/bi/search'
</script>
