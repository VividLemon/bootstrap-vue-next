<template>
  <!-- #region template -->
  <BOtpInput v-model="value3" :length="3" />
  <BOtpInput v-model="value4" :length="4" class="mt-2" />
  <BOtpInput v-model="value6" :length="6" class="mt-2" />
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import {ref} from 'vue'

const value3 = ref<string[]>([])
const value4 = ref<string[]>([])
const value6 = ref<string[]>([])
</script>
