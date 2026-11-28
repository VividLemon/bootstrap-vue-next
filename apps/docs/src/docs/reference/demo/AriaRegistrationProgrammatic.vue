<template>
  <div>
    <BButton
      v-bind="collapseToggle"
      class="mb-2"
    >
      Toggle using useComponentToggle
    </BButton>

    <BCollapse
      id="aria-demo-programmatic"
      v-model="visible"
    >
      <template #default="scope">
        <BCard>
          <p>This demonstrates combining v-model with useComponentToggle.</p>
          <p>The toggle button above has automatic ARIA management.</p>
          <p>You can close this from inside using the slot's hide function:</p>
          <div class="d-flex gap-2">
            <BButton
              :color="{theme: 'danger'}"
              size="sm"
              @click="() => scope.hide()"
            >
              Close (slot function)
            </BButton>
            <BButton
              :color="{theme: 'secondary'}"
              size="sm"
              @click="closeFromCode"
            >
              Close (v-model)
            </BButton>
          </div>
        </BCard>
      </template>
    </BCollapse>
  </div>
</template>

<script setup lang="ts">
import {useComponentToggle} from 'bootstrap-vue-next/composables/useComponentToggle'
import {ref} from 'vue'

const {props: collapseToggle} = useComponentToggle('aria-demo-programmatic')

const visible = ref(false)

// You can also control visibility programmatically
const closeFromCode = () => {
  visible.value = false
}
</script>
