<template>
  <BAutocomplete
    v-model="selected"
    v-model:search="search"
    :options="filteredOptions"
    placeholder="Type to search..."
  />
  <div class="mt-2">Selected: <strong>{{ selected }}</strong></div>
  <div>Search: <strong>{{ search }}</strong></div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'

const allOptions = ['Apple', 'Banana', 'Cranberry', 'Grapes', 'Mango', 'Orange', 'Strawberry']

const selected = ref('')
const search = ref('')

const filteredOptions = computed(() =>
  allOptions.filter((option) => option.toLowerCase().startsWith(search.value.toLowerCase()))
)
</script>
