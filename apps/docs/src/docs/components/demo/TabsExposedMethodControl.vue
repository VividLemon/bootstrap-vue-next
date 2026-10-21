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
          ref="tabGeneral"
          title="General"
          >I'm the first fading tab</BTab
        >
        <BTab
          id="tab-edit-profile"
          ref="tabEditProfile"
          title="Edit profile"
        >
          I'm the second tab
          <BCard>I'm the card in tab</BCard>
        </BTab>
        <BTab
          id="tab-premium"
          ref="tabPremium"
          title="Premium Plan"
          disabled
          >Sibzamini!</BTab
        >
        <BTab
          id="tab-info"
          ref="tabInfo"
          title="Info"
          >I'm the last tab</BTab
        >
      </BTabs>
    </BCard>

    <!-- Control buttons-->
    <div class="text-center">
      <BButtonGroup
        id="tab-controls"
        class="mt-2"
      >
        <BButton @click="tabGeneral?.activate()">General</BButton>
        <BButton @click="tabEditProfile?.activate()">Edit Profile</BButton>
        <BButton @click="tabPremium?.activate()">Premium</BButton>
        <BButton @click="tabInfo?.activate()">Info</BButton>
      </BButtonGroup>

      <div class="text-muted mt-2">Current Tab ID: {{ tabId }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, useTemplateRef} from 'vue'
// Import BTab explicitly path to get the correct type for exposed methods
//  and use the full path to improve tree shaking
import {BTab} from 'bootstrap-vue-next/components/BTabs'

const tabId = ref<string | undefined>('tab-general')

const tabGeneral = useTemplateRef<InstanceType<typeof BTab>>('tabGeneral')
const tabEditProfile = useTemplateRef<InstanceType<typeof BTab>>('tabEditProfile')
const tabPremium = useTemplateRef<InstanceType<typeof BTab>>('tabPremium')
const tabInfo = useTemplateRef<InstanceType<typeof BTab>>('tabInfo')
</script>
