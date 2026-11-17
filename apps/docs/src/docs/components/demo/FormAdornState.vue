<template>
  <!-- #region template -->
  <BFormGroup label="Email" invalid-feedback="Enter a valid email address." :state="false">
    <BFormAdorn>
      <template #start>
        <EnvelopeIcon />
      </template>
      <BFormInput type="email" model-value="not-an-email" />
    </BFormAdorn>
  </BFormGroup>
  <!-- #endregion template -->
</template>

<script setup lang="ts">
import EnvelopeIcon from '~icons/bi/envelope'
</script>
