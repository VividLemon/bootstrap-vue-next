<template>
  <!-- #region template -->
  <BFormAdorn class="mb-2">
    <template #end>
      <EnvelopeIcon />
    </template>
    <BFormInput type="email" placeholder="you@example.com" aria-label="Email" />
  </BFormAdorn>
  <BFormAdorn>
    <template #start>
      <PersonIcon />
    </template>
    <BFormInput placeholder="Username" aria-label="Username" />
    <template #end>
      <CheckIcon />
    </template>
  </BFormAdorn>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import CheckIcon from '~icons/bi/check-lg'
import EnvelopeIcon from '~icons/bi/envelope'
import PersonIcon from '~icons/bi/person'
</script>
