<template>
  <div
    ref="content"
    class="border rounded position-relative"
    style="height: 300px; overflow-y: auto"
    tabindex="0"
  >
    <BNav
      ref="nav"
      pills
      class="position-sticky top-0 bg-body border-bottom p-2"
      style="height: 64px; z-index: 1"
    >
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
    <div class="px-3">
      <template v-for="section in sections" :key="section.id">
        <h4 :id="section.id" style="scroll-margin-top: 72px">{{ section.title }}</h4>
        <p v-for="i in 3" :key="i">{{ loremText }}</p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useScrollspy } from 'bootstrap-vue-next/composables/useScrollspy'

const loremText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

const sections = [
  { id: 'spy-top-1', title: 'First' },
  { id: 'spy-top-2', title: 'Second' },
  { id: 'spy-top-3', title: 'Third' },
]

const content = useTemplateRef('content')
const nav = useTemplateRef('nav')

// The activation line sits just below the 64px sticky nav
const { current } = useScrollspy(content, nav, { topMargin: '96px' })
</script>
