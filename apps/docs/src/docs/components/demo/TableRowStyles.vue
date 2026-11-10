<template>
  <div>
    <BTable :items="items" :fields="fields" :tbody="{ trAttrs: rowAttrs }" />
  </div>
</template>

<script setup lang="ts">
import type { TableRowType } from 'bootstrap-vue-next'

interface Person {
  age: number
  first_name: string
  last_name: string
  status?: string
}

const fields = ['first_name', 'last_name', 'age']
const items = [
  { age: 40, first_name: 'Dickerson', last_name: 'Macdonald', status: 'awesome' },
  { age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  { age: 89, first_name: 'Geneva', last_name: 'Wilson' },
]

const rowAttrs = (item: Person | null, type: TableRowType): Record<string, unknown> =>
  type === 'row' && item?.status === 'awesome' ? { class: 'theme-success' } : {}
</script>
