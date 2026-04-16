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

let controller: AbortController | null = null

async function fetchOptions(query: string, signal: AbortSignal): Promise<string[]> {
  // Simulate a network request with a 400ms delay
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 400)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
  if (!query) return []
  return allFruits.filter((f) => f.toLowerCase().includes(query.toLowerCase()))
}

watch(debouncedSearch, async (query) => {
  controller?.abort()
  controller = new AbortController()
  const {signal} = controller
  loading.value = true
  try {
    results.value = await fetchOptions(query, signal)
  } catch {
    if (!signal.aborted) throw
  } finally {
    if (!signal.aborted) {
      loading.value = false
    }
  }
})
</script>
