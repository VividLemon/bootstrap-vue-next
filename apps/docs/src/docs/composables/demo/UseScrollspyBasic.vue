<template>
  <BRow>
    <BCol :cols="{ xs: 4 }">
      <BNav ref="nav" pills vertical>
        <BNavItem
          v-for="section in sections"
          :key="section.id"
          :href="`#${section.id}`"
          :active="current === section.id"
          :link-attrs="{ 'aria-current': current === section.id ? 'location' : undefined }"
        >
          {{ section.title }}
        </BNavItem>
      </BNav>
    </BCol>
    <BCol :cols="{ xs: 8 }">
      <div
        ref="content"
        class="border rounded p-3"
        style="height: 300px; overflow-y: auto"
        tabindex="0"
      >
        <template v-for="section in sections" :key="section.id">
          <h4 :id="section.id">{{ section.title }}</h4>
          <p v-for="i in 4" :key="i">{{ loremText }}</p>
        </template>
      </div>
    </BCol>
  </BRow>
  <p class="mt-2">
    Current: <strong>{{ current ?? 'none' }}</strong>
  </p>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useScrollspy } from 'bootstrap-vue-next/composables/useScrollspy'

const loremText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

const sections = [
  { id: 'spy-basic-1', title: 'Section 1' },
  { id: 'spy-basic-2', title: 'Section 2' },
  { id: 'spy-basic-3', title: 'Section 3' },
]

const content = useTemplateRef('content')
const nav = useTemplateRef('nav')

const { current } = useScrollspy(content, nav)
</script>
