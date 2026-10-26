<template>
  <BBreadcrumb>
    <BBreadcrumbItem href="#home"> Home </BBreadcrumbItem>
    <li class="breadcrumb-divider" />
    <BBreadcrumbItem href="#foo">Foo</BBreadcrumbItem>
    <li class="breadcrumb-divider" />
    <BBreadcrumbItem href="#bar" @click="alertEvent">Bar</BBreadcrumbItem>
    <li class="breadcrumb-divider" />
    <BBreadcrumbItem active>Baz</BBreadcrumbItem>
  </BBreadcrumb>
</template>

<script setup lang="ts">
const alertEvent = (event: MouseEvent) => {
  alert(`Event ${event.target}`)
}
</script>
