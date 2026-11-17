<template>
  <!-- #region template -->
  <BFormGroup label="Search" description="Search across all pages and posts.">
    <BFormAdorn>
      <template #start>
        <SearchIcon />
      </template>
      <BFormInput type="search" placeholder="Search..." />
    </BFormAdorn>
  </BFormGroup>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import SearchIcon from '~icons/bi/search'
</script>
