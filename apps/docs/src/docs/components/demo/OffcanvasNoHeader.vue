<template>
  <div>
    <BButton v-b-toggle.offcanvas-no-header>Toggle Offcanvas</BButton>
    <BOffcanvas
      id="offcanvas-no-header"
      aria-labelledby="offcanvas-no-header-title"
      no-header
      shadow
    >
      <template #default="scope">
        <div class="p-3">
          <h4 id="offcanvas-no-header-title">Custom header offcanvas</h4>
          <p>
            Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis
            in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
          </p>
          <BImg :src="imageSrc" fluid thumbnail />
          <BButton :color="{ theme: 'primary' }" block @click="() => scope.hide()"
            >Close Offcanvas</BButton
          >
        </div>
      </template>
    </BOffcanvas>
  </div>
</template>

<script setup lang="ts">
// Kept out of the template: vue-tsc >=3.3.12 loses slot-scope variables after an inline URL
// in a template attribute (https://github.com/vuejs/language-tools/issues/6240)
const imageSrc = 'https://picsum.photos/500/500/?image=54'
</script>
