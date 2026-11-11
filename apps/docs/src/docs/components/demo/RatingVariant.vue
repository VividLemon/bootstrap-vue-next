<template>
  <BFormRating v-model="rating" :color="{ theme: 'primary' }" aria-label="Primary rating" />
  <BFormRating v-model="rating" :color="{ theme: 'secondary' }" aria-label="Secondary rating" />
  <BFormRating v-model="rating" :color="{ theme: 'success' }" aria-label="Success rating" />
  <BFormRating v-model="rating" :color="{ theme: 'danger' }" aria-label="Danger rating" />
  <BFormRating v-model="rating" :color="{ theme: 'warning' }" aria-label="Warning rating" />
  <BFormRating v-model="rating" :color="{ theme: 'info' }" aria-label="Info rating" />
  <p>Current rating: {{ rating }}</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const rating = ref(3)
</script>
