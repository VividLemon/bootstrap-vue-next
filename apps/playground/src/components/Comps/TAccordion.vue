<template>
  <BContainer fluid>
    <BRow>
      <BCol>
        <p>
          <BFormSelect
            v-model="openId"
            :options="[
              {text: 'none', value: undefined},
              {text: 'id1', value: 'id1'},
              {text: 'id2', value: 'id2'},
              {text: 'id3', value: 'id3'},
            ]"
          />
        </p>
        <p>v-model: {{ openId }}</p>
        <BFormCheckbox v-model="isFree">free</BFormCheckbox>
        <p>free v-model: {{ freeIds }}</p>
        <p>toggle events: {{ toggles }}</p>
      </BCol>
      <BCol>
        <BAccordion v-model="openId" flush>
          <BAccordionItem id="id1" title="Accordion Item #1" @toggle="toggles++">
            <strong>This is the first item's accordion body.</strong>
          </BAccordionItem>
          <BAccordionItem id="id2" title="Accordion Item #2">
            <strong>This is the second item's accordion body.</strong>
          </BAccordionItem>
          <BAccordionItem id="id3" title="Accordion Item #3" lazy>
            <strong>Lazy body, rendered on first open.</strong>
          </BAccordionItem>
        </BAccordion>
      </BCol>
      <BCol>
        <BAccordion v-model="freeIds" :free="isFree" size="sm" gap :color="{theme: 'primary'}">
          <BAccordionItem id="free1" title="Free accordion Item #1">
            Don't close other items when this one is opened.
          </BAccordionItem>
          <BAccordionItem id="free2" title="Free accordion Item #2" no-transition>
            No transition on this item.
          </BAccordionItem>
          <BAccordionItem id="free3" title="Free accordion Item #3">
            Don't close other items when this one is opened.
          </BAccordionItem>
        </BAccordion>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const openId = ref<string | undefined>('id1')
const freeIds = ref<string | readonly string[] | undefined>(['free1'])
const isFree = ref(true)
const toggles = ref(0)
</script>
