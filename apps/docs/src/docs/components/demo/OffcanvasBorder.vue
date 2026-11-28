<template>
  <div>
    <BButton v-bind="offcanvasBorderToggle">Toggle Offcanvas</BButton>
    <BOffcanvas
      id="offcanvas-border"
      title="Offcanvas with Border"
      class="border-end border-danger"
    >
      <div class="px-3 py-2">
        <p>
          Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis
          in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
        </p>
        <BImg
          src="https://picsum.photos/500/500/?image=54"
          fluid
          thumbnail
        />
      </div>
    </BOffcanvas>
  </div>
</template>

<script setup lang="ts">
import {useComponentToggle} from 'bootstrap-vue-next/composables/useComponentToggle'

const {props: offcanvasBorderToggle} = useComponentToggle('offcanvas-border')
</script>
