<template>
  <!-- #region template -->
  <div class="accordion mb-2">
    <BAccordionItem v-model="open" title="An item without BAccordion">
      Without a <code>BAccordion</code> an item is a plain <code>&lt;details&gt;</code> with its own
      <code>v-model</code>. The <code>.accordion</code> wrapper provides the styling tokens.
    </BAccordionItem>
  </div>
  <BButton size="sm" @click="open = !open">Toggle ({{ open ? 'open' : 'closed' }})</BButton>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
</script>
