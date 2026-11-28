<template>
  <BRow>
    <BCol :cols="{ xs: 4 }">
      <BNav ref="nav" pills vertical>
        <BNavItem
          v-for="section in sections"
          :key="section.id"
          :href="`#${section.id}`"
          :active="activeIds.includes(section.id)"
          :link-attrs="{ 'aria-current': current === section.id ? 'location' : undefined }"
        >
          {{ section.title }}
          <template v-if="section.children" #after>
            <BNav pills vertical class="ms-3">
              <BNavItem
                v-for="child in section.children"
                :key="child.id"
                :href="`#${child.id}`"
                :active="activeIds.includes(child.id)"
                :link-attrs="{ 'aria-current': current === child.id ? 'location' : undefined }"
              >
                {{ child.title }}
              </BNavItem>
            </BNav>
          </template>
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
          <p>{{ loremText }}</p>
          <template v-for="child in section.children" :key="child.id">
            <h5 :id="child.id">{{ child.title }}</h5>
            <p>{{ loremText }}</p>
          </template>
        </template>
      </div>
    </BCol>
  </BRow>
  <p class="mt-2">
    Active ids: <strong>{{ activeIds.join(', ') || 'none' }}</strong>
  </p>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useScrollspy } from 'bootstrap-vue-next/composables/useScrollspy'

const loremText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

interface Section {
  id: string
  title: string
  children?: Section[]
}

const sections: Section[] = [
  {
    id: 'spy-nested-1',
    title: 'Item 1',
    children: [
      { id: 'spy-nested-1-1', title: 'Item 1-1' },
      { id: 'spy-nested-1-2', title: 'Item 1-2' },
    ],
  },
  { id: 'spy-nested-2', title: 'Item 2' },
  {
    id: 'spy-nested-3',
    title: 'Item 3',
    children: [
      { id: 'spy-nested-3-1', title: 'Item 3-1' },
      { id: 'spy-nested-3-2', title: 'Item 3-2' },
    ],
  },
]

const content = useTemplateRef('content')
const nav = useTemplateRef('nav')

// `activeIds` holds the active section followed by its parent sections
const { current, activeIds } = useScrollspy(content, nav)
</script>
