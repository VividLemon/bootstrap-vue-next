<template>
  <!-- #region template -->
  <div class="d-flex align-items-center gap-3">
    <BLink href="#foo" class="d-inline-flex rounded-circle" aria-label="Profile of FF">
      <BAvatar :color="{ theme: 'primary' }" text="FF" />
    </BLink>
    <button
      type="button"
      class="btn p-0 border-0 rounded-circle"
      aria-label="Open profile"
      @click="clicks++"
    >
      <BAvatar src="https://picsum.photos/80/80/?image=40" alt="" />
    </button>
    <span>Clicked {{ clicks }} times</span>
  </div>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import { ref } from 'vue'

const clicks = ref(0)
</script>
