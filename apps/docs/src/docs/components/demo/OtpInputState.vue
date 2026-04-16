<template>
  <!-- #region template -->
  <label>Valid</label>
  <BOtpInput :state="true" class="mb-2" />
  <label>Invalid</label>
  <BOtpInput :state="false" class="mb-2" />
  <label>No state</label>
  <BOtpInput class="mb-2" />
  <!-- #endregion template -->
</template>
