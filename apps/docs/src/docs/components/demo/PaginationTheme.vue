<template>
  <h6>Success</h6>
  <BPagination v-model="currentPage" theme="success" :total-rows="rows" />

  <h6>Danger</h6>
  <BPagination v-model="currentPage" theme="danger" :total-rows="rows" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentPage = ref(1)
const rows = ref(100)
</script>
