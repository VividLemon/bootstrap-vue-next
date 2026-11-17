<template>
  <!-- #region template -->
  <BAccordion v-model="open">
    <BAccordionItem id="overview-1" title="Accordion Item #1">
      <strong>This is the first item's accordion body.</strong> It is a native
      <code>&lt;details&gt;</code> element: the browser opens and closes it, and the
      <code>::details-content</code> transition animates the height. Just about any HTML can go
      within the <code>.accordion-body</code>.
    </BAccordionItem>
    <BAccordionItem id="overview-2" title="Accordion Item #2">
      <strong>This is the second item's accordion body.</strong> It is a native
      <code>&lt;details&gt;</code> element: the browser opens and closes it, and the
      <code>::details-content</code> transition animates the height. Just about any HTML can go
      within the <code>.accordion-body</code>.
    </BAccordionItem>
    <BAccordionItem id="overview-3" title="Accordion Item #3">
      <strong>This is the third item's accordion body.</strong> It is a native
      <code>&lt;details&gt;</code> element: the browser opens and closes it, and the
      <code>::details-content</code> transition animates the height. Just about any HTML can go
      within the <code>.accordion-body</code>.
    </BAccordionItem>
  </BAccordion>
  <p class="mt-2">
    Open item: <code>{{ open }}</code>
  </p>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref<string | readonly string[] | undefined>('overview-1')
</script>
