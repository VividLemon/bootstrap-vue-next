<template>
  <div>
    <BButton v-b-toggle.collapse-css theme="primary">
      <span class="when-open">Hide</span>
      <span class="when-closed">Show</span>
      Content
    </BButton>

    <BCollapse id="collapse-css" class="mt-3">
      <BCard>
        <p class="card-text">
          The button text changes based on the collapse state using the aria-expanded attribute.
        </p>
      </BCard>
    </BCollapse>
  </div>
</template>

<style scoped>
/* Hide "Hide" text when collapsed, show "Show" text */
[aria-expanded='false'] > .when-open {
  display: none;
}

/* Hide "Show" text when expanded, show "Hide" text */
[aria-expanded='true'] > .when-closed {
  display: none;
}
</style>
