<template>
  <div>
    <BButton theme="primary" @click="show = true">Show Modal</BButton>

    <BModal
      v-model="show"
      title="Modal Variants"
      :header-bg="headerBg"
      :header-fg="headerFg"
      :body-bg="bodyBg"
      :body-fg="bodyFg"
      :footer-bg="footerBg"
      :footer-fg="footerFg"
    >
      <BContainer fluid>
        <BRow class="mb-1 text-center">
          <BCol cols="3" />
          <BCol>Background</BCol>
          <BCol>Text</BCol>
        </BRow>

        <BRow class="mb-1">
          <BCol cols="3">Header</BCol>
          <BCol>
            <BFormSelect v-model="headerBg" :options="bgColors" />
          </BCol>
          <BCol>
            <BFormSelect v-model="headerFg" :options="fgColors" />
          </BCol>
        </BRow>

        <BRow class="mb-1">
          <BCol cols="3">Body</BCol>
          <BCol>
            <BFormSelect v-model="bodyBg" :options="bgColors" />
          </BCol>
          <BCol>
            <BFormSelect v-model="bodyFg" :options="fgColors" />
          </BCol>
        </BRow>

        <BRow>
          <BCol cols="3">Footer</BCol>
          <BCol>
            <BFormSelect v-model="footerBg" :options="bgColors" />
          </BCol>
          <BCol>
            <BFormSelect v-model="footerFg" :options="fgColors" />
          </BCol>
        </BRow>
      </BContainer>

      <template #footer>
        <div class="w-100">
          <p class="float-start">Modal Footer Content</p>
          <BButton theme="primary" size="sm" class="float-end" @click="show = false">
            Close
          </BButton>
        </div>
      </template>
    </BModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const show = ref(false)

const bgColors = [
  { value: null, text: 'None' },
  { value: 'primary', text: 'Primary' },
  { value: 'secondary', text: 'Secondary' },
  { value: 'success', text: 'Success' },
  { value: 'warning', text: 'Warning' },
  { value: 'danger', text: 'Danger' },
  { value: 'info', text: 'Info' },
  { value: 'inverse', text: 'Inverse' },
  { value: '1', text: 'Layer 1' },
  { value: '2', text: 'Layer 2' },
] as const

const fgColors = [
  { value: null, text: 'None' },
  { value: 'primary', text: 'Primary' },
  { value: 'secondary', text: 'Secondary' },
  { value: 'success', text: 'Success' },
  { value: 'warning', text: 'Warning' },
  { value: 'danger', text: 'Danger' },
  { value: 'info', text: 'Info' },
  { value: 'inverse', text: 'Inverse' },
  { value: 'white', text: 'White' },
  { value: 'body', text: 'Body' },
] as const

type BgColorOption = (typeof bgColors)[number]['value']
type FgColorOption = (typeof fgColors)[number]['value']

const headerBg = ref<BgColorOption>('inverse')
const headerFg = ref<FgColorOption>('white')
const bodyBg = ref<BgColorOption>('2')
const bodyFg = ref<FgColorOption>('body')
const footerBg = ref<BgColorOption>('warning')
const footerFg = ref<FgColorOption>('body')
</script>
