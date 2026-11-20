<template>
  <BBreadcrumb>
    <BBreadcrumbItem href="#home"> Home </BBreadcrumbItem>
    <BBreadcrumbDivider />
    <BBreadcrumbItem href="#foo">Foo</BBreadcrumbItem>
    <BBreadcrumbDivider />
    <BBreadcrumbItem href="#bar" @click="alertEvent">Bar</BBreadcrumbItem>
    <BBreadcrumbDivider />
    <BBreadcrumbItem active>Baz</BBreadcrumbItem>
  </BBreadcrumb>
</template>

<script setup lang="ts">
const alertEvent = (event: MouseEvent) => {
  alert(`Event ${event.target}`)
}
</script>
