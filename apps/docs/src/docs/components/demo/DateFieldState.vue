<template>
  <div class="d-flex flex-column gap-2">
    <BDateField :state="true" />
    <BDateField :state="false" />
    <BDateField :state="null" />
  </div>
</template>

<script setup lang="ts"></script>
