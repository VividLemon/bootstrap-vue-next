<template>
  <div>
    <BFormField v-slot="{ ariaDescribedby }" label="Using options array:">
      <BFormCheckboxGroup
        id="checkbox-group-1"
        v-model="selected"
        :options="options"
        :aria-describedby="ariaDescribedby"
        name="flavour-1"
      />
    </BFormField>

    <BFormField v-slot="{ ariaDescribedby }" label="Using sub-components:">
      <BFormCheckboxGroup
        id="checkbox-group-2"
        v-model="selected"
        :aria-describedby="ariaDescribedby"
        name="flavour-2"
      >
        <BFormCheckbox value="orange">Orange</BFormCheckbox>
        <BFormCheckbox value="apple">Apple</BFormCheckbox>
        <BFormCheckbox value="pineapple">Pineapple</BFormCheckbox>
        <BFormCheckbox value="grape">Grape</BFormCheckbox>
      </BFormCheckboxGroup>
    </BFormField>

    <div>
      Selected: <strong>{{ selected }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selected = ref([])

const options = [
  { text: 'Orange', value: 'orange' },
  { text: 'Apple', value: 'apple' },
  { text: 'Pineapple', value: 'pineapple' },
  { text: 'Grape', value: 'grape' },
]
</script>
