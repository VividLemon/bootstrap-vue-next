<template>
  <BContainer fluid>
    <BRow class="mb-3">
      <BCol class="d-flex align-items-center gap-2">
        <BAvatar size="xs" text="XS" />
        <BAvatar size="sm" text="SM" :color="{theme: 'success'}" />
        <BAvatar text="MD" :color="{theme: 'primary'}" variant="subtle" />
        <BAvatar size="lg" text="LG" :color="{theme: 'warning', fg: 'danger'}" />
        <BAvatar size="xl" src="https://picsum.photos/160/160/?image=40" alt="Person" />
        <BAvatar size="5rem" text="5r" status="online" />
      </BCol>
    </BRow>

    <BRow class="mb-3">
      <BCol class="d-flex align-items-center gap-3">
        <BAvatar text="ON" status="online" />
        <BAvatar text="OF" status="offline" />
        <BAvatar text="BU" status="busy" />
        <BAvatar text="AW" status="away" status-label="Away" />
        <BAvatar src="https://invalid.example/missing.png" text="FB" @img-error="errors++" />
        <span>img-error: {{ errors }}</span>
      </BCol>
    </BRow>

    <BRow>
      <BCol class="d-flex flex-column gap-3">
        <BAvatarGroup aria-label="Default stack">
          <BAvatar text="A" />
          <BAvatar text="B" :color="{theme: 'primary'}" />
          <BAvatar text="C" />
        </BAvatarGroup>
        <BAvatarGroup size="lg" :overlap="0.5" class="theme-info" aria-label="Large stack">
          <BAvatar text="A" />
          <BAvatar text="B" />
          <BAvatar text="+3" :color="{theme: 'secondary'}" />
        </BAvatarGroup>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const errors = ref(0)
</script>
