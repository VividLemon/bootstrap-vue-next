<template>
  <!-- #region template -->
  <BAccordion>
    <BAccordionItem title="Custom icon">
      <template #icon="{ open }">
        <span class="ms-auto" aria-hidden="true">{{ open ? '−' : '+' }}</span>
      </template>
      The <code>icon</code> slot replaces the default chevron.
    </BAccordionItem>
    <BAccordionItem>
      <template #title>
        <strong>Custom title</strong>&nbsp;<small class="fg-3">with markup</small>
      </template>
      The <code>title</code> slot replaces the <code>title</code> prop.
    </BAccordionItem>
  </BAccordion>
  <!-- #endregion template -->
</template>
