<template>
  <BCard no-body>
    <BTabs
      v-model="tabId"
      card
    >
      <BTab
        id="tab-1"
        title="Tab 1"
        :title-link-class="linkClass[0]"
        >Tab contents 1</BTab
      >
      <BTab
        id="tab-2"
        title="Tab 2"
        :title-link-class="linkClass[1]"
        >Tab contents 2</BTab
      >
      <BTab
        id="tab-3"
        title="Tab 3"
        :title-link-class="linkClass[2]"
        >Tab contents 3</BTab
      >
    </BTabs>
  </BCard>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'

const tabIds = ['tab-1', 'tab-2', 'tab-3'] as const
const tabId = ref<string | undefined>(tabIds[0])

const linkClass = computed(() =>
  tabIds.map((id) =>
    tabId.value === id ? ['bg-primary', 'text-light'] : ['bg-light', 'text-info']
  )
)
</script>
