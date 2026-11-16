<template>
  <li class="breadcrumb-divider" aria-hidden="true">
    <slot />
  </li>
</template>

<script setup lang="ts">
import type {BBreadcrumbDividerSlots} from '../../types'

// Bootstrap v6 separates breadcrumb items with explicit divider elements. An empty divider
// renders the default chevron (`.breadcrumb-divider:empty::before`); slot content replaces it.
// Dividers are decoration, so they are hidden from assistive technology.
defineSlots<BBreadcrumbDividerSlots>()
</script>
