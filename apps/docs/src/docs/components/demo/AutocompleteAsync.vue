<template>
  <div>
    <label for="autocomplete-async">Search users (async)</label>
    <BAutocomplete
      id="autocomplete-async"
      v-model="selectedUser"
      v-model:search="searchQuery"
      :options="users"
      :debounce="300"
      text-field="name"
      value-field="id"
      placeholder="Type to search users..."
      :filter-function="noFilter"
    />
    <p class="mt-2">
      <span v-if="loading">Loading...</span>
      <span v-else-if="selectedUser">Selected user ID: {{ selectedUser }}</span>
      <span v-else>No user selected</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import type {SelectOption} from 'bootstrap-vue-next'

const selectedUser = ref<number | undefined>(undefined)
const searchQuery = ref('')
const users = ref<{id: number; name: string}[]>([])
const loading = ref(false)

let abortController: AbortController | null = null

// Bypass built-in filter since the API handles filtering
const noFilter = (options: SelectOption[]) => options

watch(searchQuery, async (query) => {
  // Cancel any in-flight request
  if (abortController) {
    abortController.abort()
  }

  if (!query || query.length < 2) {
    users.value = []
    return
  }

  abortController = new AbortController()
  loading.value = true

  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users?name_like=${encodeURIComponent(query)}`,
      {signal: abortController.signal}
    )
    const data = await response.json()
    users.value = data.map((user: {id: number; name: string}) => ({
      id: user.id,
      name: user.name,
    }))
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      // Request was cancelled — ignore
      return
    }
    users.value = []
  } finally {
    loading.value = false
  }
})
</script>
