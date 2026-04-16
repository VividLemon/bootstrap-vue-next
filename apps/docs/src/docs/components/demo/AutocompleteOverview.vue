<template>
  <BAutocomplete
    v-model="selected"
    :options="options"
    placeholder="Choose a fruit..."
  />
  <div class="mt-2">Selected: <strong>{{ selected }}</strong></div>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const options = ['Apple', 'Banana', 'Cranberry', 'Grapes', 'Mango', 'Orange', 'Strawberry']

const selected = ref('')
</script>
