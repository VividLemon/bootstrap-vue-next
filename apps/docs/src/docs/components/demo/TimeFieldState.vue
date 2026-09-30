<template>
  <div class="d-flex flex-column gap-2">
    <BTimeField :state="true" />
    <BTimeField :state="false" />
    <BTimeField :state="null" />
  </div>
</template>

<script setup lang="ts"></script>
