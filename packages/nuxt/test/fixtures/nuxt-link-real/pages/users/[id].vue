<template>
  <h1 id="page">
    user {{ $route.params.id }}
  </h1>
</template>

<script setup lang="ts">
defineOptions({ name: 'UserPage' })
</script>
