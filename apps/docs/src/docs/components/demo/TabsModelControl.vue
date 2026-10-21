<template>
  <div>
    <!-- Tabs with card integration -->
    <BCard no-body>
      <BTabs
        v-model="tabId"
        small
        card
      >
        <BTab
          id="tab-general"
          title="General"
          >I'm the first fading tab</BTab
        >
        <BTab
          id="tab-edit-profile"
          title="Edit profile"
        >
          I'm the second tab
          <BCard>I'm the card in tab</BCard>
        </BTab>
        <BTab
          id="tab-premium"
          title="Premium Plan"
          disabled
          >Sibzamini!</BTab
        >
        <BTab
          id="tab-info"
          title="Info"
          >I'm the last tab</BTab
        >
      </BTabs>
    </BCard>

    <!-- Control buttons-->
    <div class="text-center">
      <BButtonGroup class="mt-2">
        <BButton @click="setPrevious">Previous</BButton>
        <BButton @click="setNext">Next</BButton>
      </BButtonGroup>

      <div class="text-muted mt-2">Current Tab ID: {{ tabId }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const enabledTabIds = ['tab-general', 'tab-edit-profile', 'tab-info'] as const
const tabId = ref<string | undefined>(enabledTabIds[0])

const setNext = () => {
  const current = enabledTabIds.indexOf((tabId.value ?? enabledTabIds[0]) as (typeof enabledTabIds)[number])
  tabId.value = enabledTabIds[Math.min(current + 1, enabledTabIds.length - 1)]
}

const setPrevious = () => {
  const current = enabledTabIds.indexOf((tabId.value ?? enabledTabIds[0]) as (typeof enabledTabIds)[number])
  tabId.value = enabledTabIds[Math.max(current - 1, 0)]
}
</script>
