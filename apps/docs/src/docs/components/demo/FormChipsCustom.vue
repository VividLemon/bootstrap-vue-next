<template>
  <!-- #region template -->
  <BFormChips v-model="people" aria-label="People" :color="{ theme: 'info' }">
    <template #chip="{ value, selected, remove }">
      <BChip :value="value" :active="selected" tabindex="0" dismissible @remove="remove">
        <template #icon>
          <PersonIcon />
        </template>
        {{ value }}
      </BChip>
    </template>
  </BFormChips>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PersonIcon from '~icons/bi/person-fill'

const people = ref(['Ada', 'Grace'])
</script>
