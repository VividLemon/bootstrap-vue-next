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
      <BButton class="mt-2" size="sm" @click="scrollTo('spy-smooth-1')">Back to the top</BButton>
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
          <p v-for="i in 3" :key="i">{{ loremText }}</p>
        </template>
      </div>
    </BCol>
  </BRow>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useScrollspy } from 'bootstrap-vue-next/composables/useScrollspy'

const loremText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

const sections = [
  { id: 'spy-smooth-1', title: 'Introduction' },
  { id: 'spy-smooth-2', title: 'Features' },
  { id: 'spy-smooth-3', title: 'Usage' },
  { id: 'spy-smooth-4', title: 'Conclusion' },
]

const content = useTemplateRef('content')
const list = useTemplateRef('list')

const { current, scrollTo } = useScrollspy(content, list, { smoothScroll: true })
</script>
