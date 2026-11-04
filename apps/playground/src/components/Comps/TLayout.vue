<template>
  <!-- Layout -->
  <div class="my-2">
    <h2>Layout</h2>
    <div>
      <h4 class="my-3">Basic layout</h4>
      <div class="bd-example-row">
        <BRow>
          <BCol>1 of 2</BCol>
          <BCol>2 of 2</BCol>
        </BRow>
        <BRow>
          <BCol>1 of 3</BCol>
          <BCol>2 of 3</BCol>
          <BCol>3 of 3</BCol>
        </BRow>
      </div>
    </div>
    <div>
      <h4 class="my-3">Row columns</h4>
      <div class="bd-example-row">
        <BRow :cols="{ xs: 1, sm: 2, md: 4 }">
          <BCol>Column</BCol>
          <BCol>Column</BCol>
          <BCol>Column</BCol>
          <BCol>Column</BCol>
        </BRow>
      </div>
    </div>
    <div>
      <h4 class="my-3">Variable width content</h4>
      <div class="bd-example-row">
        <BRow :align-h="{ xs: 'center' }">
          <BCol :cols="{ lg: 2 }">1 of 3</BCol>
          <BCol :cols="{ md: 'auto' }">Variable width content</BCol>
          <BCol :cols="{ lg: 2 }">3 of 3</BCol>
        </BRow>
        <BRow>
          <BCol>1 of 3</BCol>
          <BCol :cols="{ md: 'auto' }">Variable width content</BCol>
          <BCol :cols="{ lg: 2 }">3 of 3</BCol>
        </BRow>
      </div>
    </div>
  </div>
</template>
