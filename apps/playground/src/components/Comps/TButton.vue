<template>
  <BContainer fluid>
    <BRow>
      <BCol>
        <BButton v-model:pressed="buttonIsPressed" theme="primary" class="mt-3"
          >Toggle Me</BButton
        >
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        Pressed State:
        <strong>{{ buttonIsPressed }}</strong>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const buttonIsPressed = ref(false)
</script>
