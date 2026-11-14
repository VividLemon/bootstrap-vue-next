<template>
  <div>
    <BTable hover :items="items" />
  </div>
</template>

<script setup lang="ts">
const items = [
  { age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
  { age: 21, first_name: 'Larsen', last_name: 'Shaw' },
  {
    age: 89,
    first_name: 'Geneva',
    last_name: 'Wilson',
    _rowColor: { theme: 'danger' },
  },
  {
    age: 40,
    first_name: 'Thor',
    last_name: 'MacDonald',
    _cellColors: { age: { theme: 'info' }, first_name: { theme: 'warning' } },
  },
  { age: 29, first_name: 'Dick', last_name: 'Dunlap' },
]
</script>
