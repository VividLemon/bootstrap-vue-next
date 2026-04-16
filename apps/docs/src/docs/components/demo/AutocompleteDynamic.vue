<template>
  <BAutocomplete
    v-model="selected"
    :options="options"
    placeholder="Choose a fruit..."
  />
  <BButton
    class="mt-2"
    @click="addOption"
  >
    Add option
  </BButton>
  <div class="mt-2">Selected: <strong>{{ selected }}</strong></div>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const options = ref(['Apple', 'Banana', 'Cranberry'])

const selected = ref('')

let count = 0
const extras = ['Grapes', 'Mango', 'Orange', 'Strawberry', 'Pineapple', 'Watermelon']

function addOption() {
  if (count < extras.length) {
    options.value.push(extras[count])
    count++
  }
}
</script>
