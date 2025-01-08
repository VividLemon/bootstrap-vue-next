<template>
  <div v-for="[parentTree, typeValue] in Object.entries(markdownTypes)" :key="parentTree">
    <h2>{{ capitalizeWords(parentTree) }}</h2>
    <div v-for="[typeName, {value}] in Object.entries(typeValue)" :key="typeName">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="value" />
    </div>
  </div>
</template>

<script setup lang="ts">
import _markdownTypes, {type ExtractedTypes} from '../data/markdownTypes.data'
import {capitalizeWords} from '../utils/string-utils'

const markdownTypes = _markdownTypes as unknown as Record<string, Record<string, ExtractedTypes>>
</script>
