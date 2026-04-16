<template>
  <BAutocomplete
    v-model="selected"
    :options="options"
    disabled
    placeholder="Disabled autocomplete"
  />
</template>

<script setup lang="ts">
import {ref} from 'vue'

const options = ['Apple', 'Banana', 'Cranberry', 'Grapes', 'Mango', 'Orange', 'Strawberry']

const selected = ref('')
</script>
