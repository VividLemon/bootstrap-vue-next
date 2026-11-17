<template>
  <BRow>
    <BCol :cols="{ xs: 4 }">
      <BListGroup ref="list">
        <BListGroupItem
          v-for="section in sections"
          :key="section.id"
          :href="`#${section.id}`"
          :active="current === section.id"
          :aria-current="current === section.id ? 'location' : undefined"
        >
          {{ section.title }}
        </BListGroupItem>
      </BListGroup>
      <BButton class="mt-2" size="sm" @click="addSection">Add a section</BButton>
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
          <p v-for="i in 2" :key="i">{{ loremText }}</p>
        </template>
      </div>
    </BCol>
  </BRow>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { useScrollspy } from 'bootstrap-vue-next/composables/useScrollspy'

const loremText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

const sections = ref([
  { id: 'spy-dynamic-1', title: 'Section 1' },
  { id: 'spy-dynamic-2', title: 'Section 2' },
])

const addSection = () => {
  const n = sections.value.length + 1
  sections.value.push({ id: `spy-dynamic-${n}`, title: `Section ${n}` })
}

const content = useTemplateRef('content')
const list = useTemplateRef('list')

// `watchChanges` (on by default) re-scans the links and sections after Vue updates them
const { current } = useScrollspy(content, list)
</script>
