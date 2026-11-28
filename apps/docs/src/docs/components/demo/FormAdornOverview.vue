<template>
  <!-- #region template -->
  <BFormAdorn>
    <template #start>
      <SearchIcon />
    </template>
    <BFormInput v-model="query" type="search" placeholder="Search..." aria-label="Search" />
  </BFormAdorn>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SearchIcon from '~icons/bi/search'

const query = ref('')
</script>
