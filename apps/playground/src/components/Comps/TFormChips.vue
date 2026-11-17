<template>
  <BContainer fluid>
    <BRow>
      <BCol>
        <BFormGroup
          label="Chips"
          :state="state"
          invalid-feedback="Add between 2 and 5 chips"
          description="Type a value and press Enter, or separate values with a comma"
        >
          <BFormChips
            v-model="value"
            name="chips"
            :max-chips="5"
            :color="{theme: 'primary'}"
            placeholder="Add a chip..."
            @add="onAdd"
          />
        </BFormGroup>
        <p>Value: {{ value }}</p>
        <div class="d-flex flex-wrap gap-2">
          <BChip>Plain</BChip>
          <BChip active>Active</BChip>
          <BChip :color="{theme: 'success'}" dismissible value="Dismissible" @remove="onRemove" />
          <BChip disabled>Disabled</BChip>
        </div>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import type {BvEvent} from 'bootstrap-vue-next'

const value = ref<string[]>(['apple', 'orange'])
const state = computed(() => value.value.length >= 2 && value.value.length <= 5)

const onAdd = (chip: string, event: BvEvent) => {
  // Only letters
  if (!/^[a-z]+$/i.test(chip)) event.preventDefault()
}
const onRemove = (chip: string) => {
  console.log('remove', chip)
}
</script>
