<template>
  <!-- #region template -->
  <BFormInput id="user-input" list="user-list" />
  <BFormDatalist
    id="user-list"
    :options="users"
    :fields="{ value: 'id', text: 'name', disabled: 'inactive' }"
  />
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import { BFormDatalist } from 'bootstrap-vue-next/components/BForm'
import { BFormInput } from 'bootstrap-vue-next/components/BFormInput'

const users = [
  { id: 1, name: 'Alice', inactive: false },
  { id: 2, name: 'Bob', inactive: false },
  { id: 3, name: 'Charlie', inactive: true },
]
</script>
