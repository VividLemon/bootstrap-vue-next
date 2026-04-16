<template>
  <BAutocomplete
    v-model="selected"
    v-model:search="search"
    :options="results"
    placeholder="Search fruits (async)..."
  />
  <div class="mt-2">
    <BSpinner
      v-if="loading"
      small
    />
    Selected: <strong>{{ selected }}</strong>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import {refDebounced} from '@vueuse/core'

const allFruits = [
  'Apple',
  'Apricot',
  'Banana',
  'Blackberry',
  'Blueberry',
  'Cherry',
  'Cranberry',
  'Grape',
  'Lemon',
  'Mango',
  'Orange',
  'Peach',
  'Pear',
  'Pineapple',
  'Raspberry',
  'Strawberry',
  'Watermelon',
]

const selected = ref('')
const search = ref('')
const results = ref<string[]>([])
const loading = ref(false)

const debouncedSearch = refDebounced(search, 300)

let currentRequestId = 0

async function fetchOptions(query: string): Promise<string[]> {
  // Simulate a network request with a 400ms delay
  await new Promise((resolve) => setTimeout(resolve, 400))
  if (!query) return []
  return allFruits.filter((f) => f.toLowerCase().includes(query.toLowerCase()))
}

watch(debouncedSearch, async (query) => {
  const requestId = ++currentRequestId
  loading.value = true
  try {
    const data = await fetchOptions(query)
    // Drop the response if a newer request was fired
    if (requestId !== currentRequestId) return
    results.value = data
  } finally {
    if (requestId === currentRequestId) {
      loading.value = false
    }
  }
})
</script>
