<template>
  <BApp :defaults="appDefaults">
    <!-- Your application content -->
    <RouterView />
  </BApp>
</template>

<script setup lang="ts">
import { BApp, type BAppProps } from 'bootstrap-vue-next'

const appDefaults: BAppProps['defaults'] = {
  BButton: {
    theme: 'info',
    size: 'lg',
  },
  BModal: {
    centered: true,
    noCloseOnBackdrop: true,
  },
  BToast: {
    theme: 'success',
    solid: true,
  },
}
</script>
